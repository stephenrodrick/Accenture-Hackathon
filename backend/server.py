from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import logging
import os
import requests
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('farm_advisor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Serve frontend files
@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# Constants
DATASET_PATH = os.path.join(os.path.dirname(__file__), 'data', 'farming_advisor_dataset.csv')
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', 'cb669b0e7977e5085210c5309da7b642')
WEATHER_API_URL = 'http://api.openweathermap.org/data/2.5/weather'

class IntegratedFarmingSystem:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.scaler = None
        self.data = self.load_data()
        self.initialize_model()
        self.historical_data = []

    def load_data(self):
        try:
            if os.path.exists(DATASET_PATH):
                df = pd.read_excel(DATASET_PATH, engine='openpyxl')
                logger.info(f"Successfully loaded {len(df)} records from dataset")
                
                # Validate required columns
                required_columns = ['soil_type', 'water_availability', 'temperature', 
                                 'rainfall', 'crop_yield', 'soil_ph']
                missing_columns = [col for col in required_columns if col not in df.columns]
                
                if missing_columns:
                    logger.error(f"Missing required columns: {missing_columns}")
                    return self._create_sample_data()
                
                return df
            else:
                logger.warning(f"Dataset not found at {DATASET_PATH}")
                return self._create_sample_data()
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            return self._create_sample_data()

    def _create_sample_data(self):
        logger.info("Creating sample dataset")
        return pd.DataFrame({
            'soil_type': ['clay', 'loam', 'sandy', 'silt', 'peat'],
            'water_availability': ['high', 'medium', 'low', 'high', 'medium'],
            'temperature': ['warm', 'cool', 'moderate', 'warm', 'cool'],
            'rainfall': ['high', 'medium', 'low', 'medium', 'high'],
            'recommended_crop': ['rice', 'wheat', 'corn', 'potato', 'soybean']
        })

    def initialize_model(self):
        try:
            if self.data is not None and not self.data.empty:
                X = self.data.drop('recommended_crop', axis=1)
                y = self.data['recommended_crop']

                # Encode categorical variables
                for column in X.select_dtypes(include=['object']).columns:
                    self.label_encoders[column] = LabelEncoder()
                    X[column] = self.label_encoders[column].fit_transform(X[column])

                # Scale features
                self.scaler = StandardScaler()
                X = self.scaler.fit_transform(X)

                # Train model with improved parameters
                self.model = RandomForestClassifier(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42,
                    class_weight='balanced'
                )
                self.model.fit(X, y)
                logger.info("Model trained successfully")
        except Exception as e:
            logger.error(f"Error initializing model: {str(e)}")

    def get_recommendations(self, input_data):
        try:
            if not self.model:
                raise ValueError("Model not initialized")

            # Prepare input data
            input_df = pd.DataFrame([input_data])
            
            # Encode and scale input
            for column, encoder in self.label_encoders.items():
                if column in input_df.columns:
                    input_df[column] = encoder.transform(input_df[column])
            
            input_scaled = self.scaler.transform(input_df)
            
            # Get predictions
            prediction = self.model.predict(input_scaled)[0]
            probabilities = self.model.predict_proba(input_scaled)[0]
            
            # Store historical data
            self.historical_data.append({
                'date': datetime.now().isoformat(),
                'input': input_data,
                'prediction': prediction
            })
            
            return {
                'primary_crop': prediction,
                'confidence': float(max(probabilities)),
                'alternative_crops': self._get_alternative_crops(prediction, probabilities),
                'sustainability_metrics': self._get_sustainability_metrics(prediction),
                'weather_impact': self._get_weather_impact(input_data)
            }
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            raise

    def _get_alternative_crops(self, primary_crop, probabilities):
        alternatives = [(crop, prob) for crop, prob in zip(self.model.classes_, probabilities)]
        alternatives = sorted(alternatives, key=lambda x: x[1], reverse=True)
        return [crop for crop, _ in alternatives if crop != primary_crop][:3]

    def _get_sustainability_metrics(self, crop):
        metrics = {
            'rice': {'water': 8, 'carbon': 7, 'soil': 6},
            'wheat': {'water': 6, 'carbon': 5, 'soil': 4},
            'corn': {'water': 7, 'carbon': 6, 'soil': 5},
            'potato': {'water': 5, 'carbon': 4, 'soil': 7},
            'soybean': {'water': 4, 'carbon': 8, 'soil': 8}
        }
        return metrics.get(crop, {'water': 5, 'carbon': 5, 'soil': 5})

    def _get_weather_impact(self, input_data):
        return {
            'risk_level': self._calculate_risk_level(input_data),
            'recommendations': self._get_weather_recommendations(input_data)
        }

    def _calculate_risk_level(self, input_data):
        risk_factors = {
            'high': 3,
            'medium': 2,
            'low': 1
        }
        
        total_risk = (
            risk_factors.get(input_data.get('rainfall', 'medium'), 2) +
            risk_factors.get(input_data.get('water_availability', 'medium'), 2)
        )
        
        if total_risk >= 5:
            return 'high'
        elif total_risk >= 3:
            return 'medium'
        return 'low'

    def _get_weather_recommendations(self, input_data):
        recommendations = []
        if input_data.get('rainfall') == 'high':
            recommendations.append("Consider improved drainage systems")
        if input_data.get('water_availability') == 'low':
            recommendations.append("Implement water conservation techniques")
        return recommendations

    def get_historical_data(self):
        return self.historical_data

class DataHandler:
    def __init__(self):
        self.farm_data = None
        self.market_data = None
        self.load_data()

    def load_data(self):
        try:
            # Define file paths
            farm_data_path = os.path.join(os.path.dirname(__file__), 'data', 'farmer_advisor_dataset.csv')
            market_data_path = os.path.join(os.path.dirname(__file__), 'data', 'market_researcher_dataset.csv')

            # Check if files exist
            if not os.path.exists(farm_data_path):
                logger.error(f"Farm data file not found at: {farm_data_path}")
                self.farm_data = self._create_sample_farm_data()
            else:
                self.farm_data = pd.read_excel(farm_data_path, engine='openpyxl')
                logger.info(f"Farm data loaded successfully with {len(self.farm_data)} records")

            if not os.path.exists(market_data_path):
                logger.error(f"Market data file not found at: {market_data_path}")
                self.market_data = self._create_sample_market_data()
            else:
                self.market_data = pd.read_excel(market_data_path, engine='openpyxl')
                logger.info(f"Market data loaded successfully with {len(self.market_data)} records")

        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            self.farm_data = self._create_sample_farm_data()
            self.market_data = self._create_sample_market_data()

    def _create_sample_farm_data(self):
        logger.info("Creating sample farm data")
        return pd.DataFrame({
            'soilph': [6.5, 7.0, 6.8, 7.2, 6.3],
            'soil_mixture': ['clay', 'loam', 'sandy', 'silt', 'clay'],
            'temperature': ['warm', 'cool', 'moderate', 'warm', 'cool'],
            'rainfall': ['high', 'medium', 'low', 'medium', 'high'],
            'croptype': ['rice', 'wheat', 'corn', 'potato', 'soybean'],
            'fertilizer_usuage': [100, 80, 90, 85, 95],
            'pesticide_usuage': [50, 40, 45, 35, 55],
            'crop_yield': [4.5, 3.8, 4.2, 3.9, 4.1],
            'sustainability': [8, 7, 6, 8, 7]
        })

    def _create_sample_market_data(self):
        logger.info("Creating sample market data")
        return pd.DataFrame({
            'product': ['rice', 'wheat', 'corn', 'potato', 'soybean'],
            'demand': [85, 75, 80, 70, 78],
            'supply': [80, 70, 75, 65, 72],
            'economic': [7.5, 6.8, 7.2, 6.5, 7.0],
            'weather': ['favorable', 'moderate', 'favorable', 'unfavorable', 'moderate'],
            'seasonal': ['summer', 'winter', 'spring', 'autumn', 'summer'],
            'consumer': ['high', 'medium', 'high', 'medium', 'high'],
            'trend_index': [8.5, 7.8, 8.2, 7.5, 8.0]
        })

# Initialize the integrated system
farming_system = IntegratedFarmingSystem()

# Initialize data handler
data_handler = DataHandler()

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_status": "initialized" if farming_system.model else "not initialized"
    })

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.json
        required_fields = ['soil_type', 'water_availability', 'temperature', 'rainfall']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
            
        recommendations = farming_system.get_recommendations(data)
        return jsonify(recommendations)
    except Exception as e:
        logger.error(f"Error in recommendations endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/farm-data', methods=['GET'])
def get_farm_data():
    try:
        df = pd.read_csv('data/farmer_advisor_dataset.csv')
        return jsonify({
            'averages': {
                'soilph': float(df['soilph'].mean()),
                'crop_yield': float(df['crop_yield'].mean()),
                'fertilizer_usage': float(df['fertilizer_usuage'].mean()),
                'pesticide_usage': float(df['pesticide_usuage'].mean()),
                'sustainability': float(df['sustainability'].mean())
            },
            'distributions': {
                'soil_mixture': df['soil_mixture'].value_counts().to_dict(),
                'croptype': df['croptype'].value_counts().to_dict(),
                'temperature': df['temperature'].value_counts().to_dict(),
                'rainfall': df['rainfall'].value_counts().to_dict()
            },
            'resource_usage': {
                'fertilizer': {
                    'data': df['fertilizer_usuage'].tolist(),
                    'labels': df.index.tolist()
                },
                'pesticide': {
                    'data': df['pesticide_usuage'].tolist(),
                    'labels': df.index.tolist()
                }
            },
            'raw_data': df.to_dict('records')
        })
    except Exception as e:
        logger.error(f"Error reading farm data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/market-data', methods=['GET'])
def get_market_data():
    try:
        df = pd.read_csv('data/market_researcher_dataset.csv')
        return jsonify({
            'trends': {
                'demand': df['demand'].tolist(),
                'supply': df['supply'].tolist(),
                'economic': df['economic'].tolist(),
                'trend_index': df['trend_index'].tolist()
            },
            'distributions': {
                'seasonal': df['seasonal'].value_counts().to_dict(),
                'weather': df['weather'].value_counts().to_dict(),
                'consumer': df['consumer'].value_counts().to_dict()
            },
            'products': {
                'data': df.groupby('product').agg({
                    'demand': 'mean',
                    'supply': 'mean',
                    'trend_index': 'mean'
                }).to_dict('index')
            },
            'raw_data': df.to_dict('records')
        })
    except Exception as e:
        logger.error(f"Error reading market data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/historical', methods=['GET'])
def get_historical_data():
    try:
        historical_data = farming_system.get_historical_data()
        return jsonify({
            "total_predictions": len(historical_data),
            "predictions": historical_data
        })
    except Exception as e:
        logger.error(f"Error in historical endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/detailed-farm-data', methods=['GET'])
def get_detailed_farm_data():
    try:
        df = farming_system.data
        if df is None or df.empty:
            return jsonify({"error": "No data available"}), 404
            
        summary = {
            "totalRecords": len(df),
            "soilAnalysis": {
                "types": df['soil_type'].value_counts().to_dict(),
                "avgPH": float(df['soil_ph'].mean()),
                "phRange": {
                    "min": float(df['soil_ph'].min()),
                    "max": float(df['soil_ph'].max())
                }
            },
            "cropYields": {
                "average": float(df['crop_yield'].mean()),
                "byCrop": df.groupby('recommended_crop')['crop_yield'].mean().to_dict()
            },
            "weatherPatterns": {
                "temperature": df['temperature'].value_counts().to_dict(),
                "rainfall": df['rainfall'].value_counts().to_dict()
            }
        }
        return jsonify(summary)
    except Exception as e:
        logger.error(f"Error in detailed farm data endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

import os

required_structure = {
    'frontend': {
        'css': ['styles.css', 'market.css', 'data-visualization.css', 'history.css', 'recommendation.css'],
        'js': ['main.js', 'market.js','dashboard.js','config.js', 'history.js', 'recommendations.js', 'api-service.js', 'data-visualization.js', 'dataService.js']
    },
    'backend': {
        'data': ['farmer_advisor_dataset.csv', 'market_researcher_dataset.csv'],
        'files': ['server.py', '__init__.py']
    }
}

def verify_structure(base_path):
    errors = []
    
    for main_dir in required_structure:
        dir_path = os.path.join(base_path, main_dir)
        if not os.path.exists(dir_path):
            errors.append(f"Missing directory: {dir_path}")
            continue
            
        for sub_dir, files in required_structure[main_dir].items():
            if sub_dir == 'files':
                for file in files:
                    file_path = os.path.join(dir_path, file)
                    if not os.path.exists(file_path):
                        errors.append(f"Missing file: {file_path}")
            else:
                sub_path = os.path.join(dir_path, sub_dir)
                if not os.path.exists(sub_path):
                    errors.append(f"Missing directory: {sub_path}")
                    continue
                    
                for file in files:
                    file_path = os.path.join(sub_path, file)
                    if not os.path.exists(file_path):
                        errors.append(f"Missing file: {file_path}")
    
    return errors

if __name__ == "__main__":
    base_path = "D:\\Accenture Hackathon"
    errors = verify_structure(base_path)
    
    if errors:
        print("❌ Structure verification failed:")
        for error in errors:
            print(f"  - {error}")
    else:
        print("✅ Structure verification passed!")

if __name__ == '__main__':
    # Verify directory structure
    base_path = "D:\\Accenture Hackathon"
    errors = verify_structure(base_path)
    
    if errors:
        logger.error("Structure verification failed:")
        for error in errors:
            logger.error(f"  - {error}")
    else:
        logger.info("Structure verification passed!")
        
        # Start the server
        logger.info("Starting Flask server...")
        logger.info(f"Dataset path: {DATASET_PATH}")        
        logger.info(f"Weather API Key: {WEATHER_API_KEY}")
        logger.info(f"Weather API URL: {WEATHER_API_URL}")
        app.run(host='0.0.0.0', port=5000, debug=True)

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import json

app = Flask(__name__)
CORS(app)

# Load datasets
def load_datasets():
    try:
        farm_data_path = os.path.join(os.path.dirname(__file__), 'data', 'farmer_advisor_dataset.csv')
        market_data_path = os.path.join(os.path.dirname(__file__), 'data', 'market_researcher_dataset.csv')
        
        if not os.path.exists(farm_data_path):
            logger.error(f"Farm data file not found: {farm_data_path}")
            return None, None
            
        if not os.path.exists(market_data_path):
            logger.error(f"Market data file not found: {market_data_path}")
            return None, None
            
        farming_data = pd.read_csv(farm_data_path)
        market_data = pd.read_csv(market_data_path)
        
        return farming_data, market_data
    except Exception as e:
        logger.error(f"Error loading datasets: {str(e)}")
        return None, None

@app.route('/api/farming-data')
def get_farming_data():
    farming_data, _ = load_datasets()
    return jsonify(farming_data.to_dict(orient='records'))

@app.route('/api/market-data')
def get_market_data():
    _, market_data = load_datasets()
    return jsonify(market_data.to_dict(orient='records'))

@app.route('/api/soil-data')
def get_soil_data():
    farming_data, _ = load_datasets()
    soil_data = farming_data[['Farm_ID', 'Soil_pH', 'Soil_Moisture', 'Temperature_C', 'Rainfall_mm']]
    return jsonify(soil_data.to_dict(orient='records'))

@app.route('/api/recommendations')
def get_recommendations():
    soil_type = request.args.get('soilType')
    season = request.args.get('season')
    
    farming_data, market_data = load_datasets()
    
    # Process data and generate recommendations
    recommendations = generate_recommendations(farming_data, market_data, soil_type, season)
    return jsonify(recommendations)

def generate_recommendations(farming_data, market_data, soil_type, season):
    # Implement your recommendation logic here
    return {
        'stats': {
            'optimalCrops': 12,
            'waterSavings': 25,
            'yieldIncrease': 30
        },
        'recommendations': {
            'crops': [
                {'name': 'Wheat', 'confidence': 95},
                {'name': 'Soybeans', 'confidence': 88},
                {'name': 'Corn', 'confidence': 82}
            ],
            'irrigation': [
                {'days': 'Mon/Thu', 'amount': 2.5},
                {'days': 'Wed/Sat', 'amount': 1.8}
            ],
            'soilTreatment': [
                'Add nitrogen-rich fertilizer',
                'Maintain pH level at 6.5-7.0',
                'Increase organic matter content'
            ]
        }
    }

@app.route('/api/historical-data')
def get_historical_data():
    farming_data, _ = load_datasets()
    if farming_data is None:
        return jsonify({'error': 'Failed to load historical data'}), 500

    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    
    # Filter data based on date range if provided
    return jsonify(farming_data.to_dict(orient='records'))

@app.route('/api/weather-data')
def get_weather_data():
    farming_data, _ = load_datasets()
    if farming_data is None:
        return jsonify({'error': 'Failed to load weather data'}), 500

    weather_data = farming_data[['Temperature_C', 'Rainfall_mm']].mean().to_dict()
    return jsonify(weather_data)

@app.route('/api/crop-analysis')
def get_crop_analysis():
    farming_data, _ = load_datasets()
    if farming_data is None:
        return jsonify({'error': 'Failed to load crop analysis'}), 500

    crop_analysis = farming_data.groupby('Crop_Type').agg({
        'Crop_Yield_ton': 'mean',
        'Sustainability_Score': 'mean'
    }).to_dict(orient='index')
    return jsonify(crop_analysis)

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

def load_datasets():
    try:
        farming_data = pd.read_csv('data/farmer_advisor_dataset.csv')
        market_data = pd.read_csv('data/market_researcher_dataset.csv')
        return farming_data, market_data
    except Exception as e:
        print(f"Error loading datasets: {e}")
        return None, None

@app.route('/api/farming-data')
def get_farming_data():
    farming_data, _ = load_datasets()
    if farming_data is not None:
        return jsonify(farming_data.to_dict(orient='records'))
    return jsonify({'error': 'Failed to load farming data'}), 500

@app.route('/api/market-data')
def get_market_data():
    _, market_data = load_datasets()
    if market_data is not None:
        return jsonify(market_data.to_dict(orient='records'))
    return jsonify({'error': 'Failed to load market data'}), 500

@app.route('/api/soil-data')
def get_soil_data():
    farming_data, _ = load_datasets()
    if farming_data is not None:
        soil_columns = ['Farm_ID', 'Soil_pH', 'Soil_Moisture', 'Temperature_C', 'Rainfall_mm']
        soil_data = farming_data[soil_columns]
        return jsonify(soil_data.to_dict(orient='records'))
    return jsonify({'error': 'Failed to load soil data'}), 500

@app.route('/api/recommendations')
def get_recommendations():
    farming_data, market_data = load_datasets()
    if farming_data is None or market_data is None:
        return jsonify({'error': 'Failed to load data'}), 500

    soil_type = request.args.get('soilType')
    season = request.args.get('season')
    
    # Process recommendations based on the data
    recommendations = generate_recommendations(farming_data, market_data, soil_type, season)
    return jsonify(recommendations)

@app.route('/api/historical-data')
def get_historical_data():
    farming_data, _ = load_datasets()
    if farming_data is None:
        return jsonify({'error': 'Failed to load historical data'}), 500

    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    
    # Filter data based on date range if provided
    return jsonify(farming_data.to_dict(orient='records'))

@app.route('/api/weather-data')
def get_weather_data():
    farming_data, _ = load_datasets()
    if farming_data is None:
        return jsonify({'error': 'Failed to load weather data'}), 500

    weather_data = farming_data[['Temperature_C', 'Rainfall_mm']].mean().to_dict()
    return jsonify(weather_data)

@app.route('/api/crop-analysis')
def get_crop_analysis():
    farming_data, _ = load_datasets()
    if farming_data is None:
        return jsonify({'error': 'Failed to load crop analysis'}), 500

    crop_analysis = farming_data.groupby('Crop_Type').agg({
        'Crop_Yield_ton': 'mean',
        'Sustainability_Score': 'mean'
    }).to_dict(orient='index')
    return jsonify(crop_analysis)

def generate_recommendations(farming_data, market_data, soil_type, season):
    # Implement your recommendation logic here
    return {
        'stats': {
            'optimalCrops': len(farming_data['Crop_Type'].unique()),
            'waterSavings': farming_data['Soil_Moisture'].mean(),
            'yieldIncrease': farming_data['Crop_Yield_ton'].mean()
        },
        'recommendations': {
            'crops': [
                {'name': crop, 'confidence': 95 - i * 5} 
                for i, crop in enumerate(farming_data['Crop_Type'].unique())
            ],
            'irrigation': [
                {'days': 'Mon/Thu', 'amount': 2.5},
                {'days': 'Wed/Sat', 'amount': 1.8}
            ],
            'soilTreatment': [
                'Add nitrogen-rich fertilizer',
                'Maintain pH level at 6.5-7.0',
                'Increase organic matter content'
            ]
        }
    }

if __name__ == '__main__':
    app.run(debug=True)