# SmartAgroAI: Multi-Agent System for Sustainable Agriculture
# Accenture Hackathon Project – 2025

# SmartAgroAI is a full-stack AI-powered multi-agent system designed to optimize sustainable farming practices. 
                  It brings together farmers, market researchers, and weather stations using intelligent recommendations that reduce 
                  environmental impact—like water consumption, carbon footprint, and soil erosion.

# Project Structure
.
├── backend/
│   ├── data/
│   │   ├── farmer_advisor_dataset.xlsx
│   │   └── market_researcher_dataset.xlsx
│   ├── server.py                  # Main Flask backend logic
│   ├── model.py                   # Crop prediction logic and model loading
│   ├── database.py                # Interfacing with datasets
│   └── weather_api.py             # External API integration for weather
│
├── frontend/
│   ├── css/
│   │   ├── styles.css
│   │   ├── market.css
│   │   └── recommendation.css
│   ├── js/
│   │   ├── api-service.js
│   │   ├── dataService.js
│   │   ├── recommendations.js
│   │   ├── config.js
│   │   └── connection-check.js
│   ├── index.html
│   ├── market.html
│   └── recommendations.html
│
├── model.pkl                      # Trained ML model (Random Forest)
├── soil_encoder.pkl              # LabelEncoder for soil_type
├── weather_encoder.pkl           # LabelEncoder for weather
├── requirements.txt
└── README.md
""")

# How It Works

- ✅ Trained a Random Forest Classifier on farmer and market datasets (.xlsx) using soil, water, and weather data.
- ✅ Loaded encoders and model in model.py for accurate crop predictions.
- ✅ server.py uses Flask to serve the frontend and provide real-time crop & soil treatment recommendations.
- ✅ Weather data is pulled from OpenWeatherMap API (weather_api.py).
- ✅ The frontend connects via api-service.js and connection-check.js to fetch results dynamically.
""")

# Demo Preview
doc.add_heading('🚀 Demo Preview', level=2)
doc.add_paragraph("""
Backend Running Log:
INFO – Creating sample farm data
INFO – Creating sample market data
INFO – Structure verification passed!
INFO – Starting Flask server…
INFO – Dataset path: d:\\Accenture Hackathon\\backend\\data
INFO – Weather API Key Loaded ✅
Flask app running on http://localhost:5000
""")

# How to Run Locally
doc.add_heading('🔧 How to Run Locally', level=2)
doc.add_paragraph("""
1. Clone the repository
    git clone https://github.com/your-username/smartagroai.git
    cd smartagroai

2. Set up the virtual environment
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\\Scripts\\activate

3. Install dependencies
    pip install -r requirements.txt

4. Run the Flask backend
    cd backend
    python server.py

5. Access Frontend
    Open index.html from the frontend/ directory in your browser.
""")

# API Routes
doc.add_heading('🌐 API Routes', level=2)
doc.add_paragraph("""
- /predict_crop – Predicts crop based on soil, water, and weather input
- /get_weather – Fetches current weather
- /get_crop_analysis – Returns performance insights
""")

# Dependencies
doc.add_heading('📌 Dependencies', level=2)
doc.add_paragraph("""
Flask==2.0.1
scikit-learn==1.1.3
pandas==1.5.3
joblib==1.2.0
openpyxl==3.1.2
requests==2.31.0
flask-cors==3.0.10
""")

# AI Focus Areas
doc.add_heading('🧠 AI Focus Areas', level=2)
doc.add_paragraph("""
- Crop prediction based on soil moisture and weather
- Soil treatment and irrigation schedule suggestions
- Yield increase & water-saving insights
- Future scalability for pest control and CO₂ monitoring
""")

# Preview
doc.add_heading('📸 Preview', level=2)
doc.add_paragraph("""
📷 Screenshot: server.py log running with model and dataset loaded from /backend/data folder.
✔️ All files connected, Flask API working, weather API successfully called.
""")

# Status
doc.add_heading('🏁 Status', level=2)
doc.add_paragraph("""
✔️ server.py successfully connects with frontend
✔️ Weather API functional
✔️ Crop recommendations rendering in UI
✔️ Model + encoders (.pkl) are working with live inputs
""")

# Team
doc.add_heading('🤝 Team', level=2)
doc.add_paragraph("""
- Stephen Rodrick – ML Engineer & Full Stack Developer
- Swati Gupta- Frontend Developer

# License
doc.add_heading('📩 License', level=2)
doc.add_paragraph("This project is under the MIT License.")


