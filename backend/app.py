"""
Flask Backend Server for Python Integration
Handles API requests from React frontend and processes data using Python scripts
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import sys
import traceback

# Add scripts directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'scripts'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'config'))

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend
socketio = SocketIO(app, cors_allowed_origins="*")  # WebSocket support

# Initialize database (optional - will work without it)
try:
    from database import Database
    db = Database()
except Exception as e:
    print(f"⚠️ Database not available: {e}")
    db = None

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
SCRIPTS_DIR = os.path.join(os.path.dirname(__file__), 'scripts')
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

@app.route('/', methods=['GET'])
def root():
    """Root endpoint - API information"""
    return jsonify({
        'message': 'Python Backend API is running',
        'version': '1.0.0',
            'endpoints': {
            'health': '/api/health',
            'list_datasets': '/api/python/datasets',
            'list_scripts': '/api/python/scripts',
            'run_script': '/api/python/run (POST)',
            'process_data': '/api/python/process (POST)',
            'readings': '/api/readings (GET, POST)',
            'statistics': '/api/statistics (GET)',
            'project_readings': '/api/project-readings (GET)',
            'sensor_live': '/api/sensor/live (GET)'
        },
        'status': 'ready'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Python backend is running',
        'data_dir': DATA_DIR,
        'scripts_dir': SCRIPTS_DIR,
        'models_dir': MODELS_DIR
    })

@app.route('/api/python/process', methods=['POST'])
def process_data():
    """
    Process data using Python script
    Expects JSON body with:
    - script_name: name of the Python script to run (without .py)
    - data: optional data to pass to the script
    - dataset: optional dataset filename to use
    """
    try:
        data = request.get_json()
        script_name = data.get('script_name', 'main')
        input_data = data.get('data', {})
        dataset_name = data.get('dataset', None)
        
        # Import and run the script
        try:
            script_module = __import__(script_name, fromlist=[''])
            
            # Prepare arguments
            kwargs = {}
            if dataset_name:
                dataset_path = os.path.join(DATA_DIR, dataset_name)
                if os.path.exists(dataset_path):
                    kwargs['dataset_path'] = dataset_path
                else:
                    return jsonify({
                        'error': f'Dataset not found: {dataset_name}',
                        'available_datasets': os.listdir(DATA_DIR) if os.path.exists(DATA_DIR) else []
                    }), 404
            
            # Add any additional input data
            kwargs.update(input_data)
            
            # Check if script has a main function
            if hasattr(script_module, 'main'):
                result = script_module.main(**kwargs)
            elif hasattr(script_module, 'process'):
                result = script_module.process(**kwargs)
            else:
                # Try to run the script directly
                result = script_module.run(**kwargs) if hasattr(script_module, 'run') else {'message': 'Script executed', 'data': input_data}
            
            return jsonify({
                'success': True,
                'result': result,
                'script': script_name
            })
            
        except ImportError as e:
            return jsonify({
                'error': f'Script not found: {script_name}',
                'details': str(e),
                'available_scripts': [f.replace('.py', '') for f in os.listdir(SCRIPTS_DIR) if f.endswith('.py')] if os.path.exists(SCRIPTS_DIR) else []
            }), 404
            
    except Exception as e:
        return jsonify({
            'error': 'Processing failed',
            'details': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/python/datasets', methods=['GET'])
def list_datasets():
    """List available datasets"""
    try:
        if os.path.exists(DATA_DIR):
            datasets = [f for f in os.listdir(DATA_DIR) if os.path.isfile(os.path.join(DATA_DIR, f))]
            return jsonify({
                'success': True,
                'datasets': datasets,
                'count': len(datasets)
            })
        else:
            return jsonify({
                'success': True,
                'datasets': [],
                'count': 0,
                'message': 'Data directory does not exist'
            })
    except Exception as e:
        return jsonify({
            'error': 'Failed to list datasets',
            'details': str(e)
        }), 500

@app.route('/api/python/scripts', methods=['GET'])
def list_scripts():
    """List available Python scripts"""
    try:
        if os.path.exists(SCRIPTS_DIR):
            scripts = [f.replace('.py', '') for f in os.listdir(SCRIPTS_DIR) if f.endswith('.py')]
            return jsonify({
                'success': True,
                'scripts': scripts,
                'count': len(scripts)
            })
        else:
            return jsonify({
                'success': True,
                'scripts': [],
                'count': 0,
                'message': 'Scripts directory does not exist'
            })
    except Exception as e:
        return jsonify({
            'error': 'Failed to list scripts',
            'details': str(e)
        }), 500

@app.route('/api/python/run', methods=['POST'])
def run_script():
    """
    Run a Python script with optional parameters
    This is a more flexible endpoint that can handle different script types
    """
    try:
        data = request.get_json()
        script_name = data.get('script_name')
        
        if not script_name:
            return jsonify({'error': 'script_name is required'}), 400
        
        # Import the script
        try:
            script_module = __import__(script_name, fromlist=[''])
            
            # Get parameters (excluding script_name)
            params = {k: v for k, v in data.items() if k != 'script_name'}
            
            # Handle dataset path if provided
            if 'dataset' in params:
                dataset_path = os.path.join(DATA_DIR, params['dataset'])
                if os.path.exists(dataset_path):
                    params['dataset_path'] = dataset_path
                    del params['dataset']
                else:
                    return jsonify({
                        'error': f'Dataset not found: {params["dataset"]}'
                    }), 404
            
            # Try different function names
            result = None
            if hasattr(script_module, 'main'):
                result = script_module.main(**params)
            elif hasattr(script_module, 'process'):
                result = script_module.process(**params)
            elif hasattr(script_module, 'run'):
                result = script_module.run(**params)
            else:
                # If no standard function, return module info
                result = {
                    'message': 'Script loaded but no main/process/run function found',
                    'available_functions': [attr for attr in dir(script_module) if not attr.startswith('_')]
                }
            
            return jsonify({
                'success': True,
                'result': result,
                'script': script_name
            })
            
        except ImportError as e:
            return jsonify({
                'error': f'Could not import script: {script_name}',
                'details': str(e)
            }), 404
            
    except Exception as e:
        return jsonify({
            'error': 'Script execution failed',
            'details': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested URL was not found on the server.',
        'available_endpoints': [
            'GET /',
            'GET /api/health',
            'GET /api/python/datasets',
            'GET /api/python/scripts',
            'POST /api/python/run',
            'POST /api/python/process',
            'GET /api/readings',
            'GET /api/project-readings',
            'GET /api/sensor/live'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error',
        'message': 'An error occurred while processing your request.'
    }), 500

@app.route('/api/python/predict', methods=['POST'])
def predict_plant_health():
    """
    Make predictions on new plant data using the trained model
    Expects JSON body with plant sensor data
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Import the plant health model
        try:
            import sys
            import os
            sys.path.append(SCRIPTS_DIR)
            from plant_health_model import predict
            import pandas as pd
            import pickle
            
            model_path = os.path.join(MODELS_DIR, 'plant_health_model.pt')
            scaler_path = os.path.join(MODELS_DIR, 'scaler.pkl')
            encoder_path = os.path.join(MODELS_DIR, 'label_encoder.pkl')
            
            # Check if model exists
            if not os.path.exists(model_path):
                return jsonify({
                    'error': 'Model not found',
                    'message': 'Please train the model first using the Python Integration page'
                }), 404
            
            # Convert input data to DataFrame
            # Handle both single prediction and batch predictions
            if isinstance(data, list):
                df = pd.DataFrame(data)
            else:
                df = pd.DataFrame([data])
            
            # Make predictions
            result = predict(model_path, scaler_path, encoder_path, df)
            
            return jsonify({
                'success': True,
                'predictions': result['predictions'],
                'probabilities': result['probabilities'],
                'classes': result['classes']
            })
            
        except ImportError as e:
            return jsonify({
                'error': 'Could not import model',
                'details': str(e)
            }), 500
        except Exception as e:
            return jsonify({
                'error': 'Prediction failed',
                'details': str(e),
                'traceback': traceback.format_exc()
            }), 500
            
    except Exception as e:
        return jsonify({
            'error': 'Request processing failed',
            'details': str(e)
        }), 500

@app.route('/api/python/model/info', methods=['GET'])
def get_model_info():
    """Get information about the trained model"""
    try:
        import json
        import os
        
        metadata_path = os.path.join(MODELS_DIR, 'model_metadata.json')
        
        if not os.path.exists(metadata_path):
            return jsonify({
                'error': 'Model not found',
                'message': 'No trained model available'
            }), 404
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        return jsonify({
            'success': True,
            'model_exists': True,
            'metadata': metadata
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get model info',
            'details': str(e)
        }), 500

@app.route('/api/python/dataset/data', methods=['GET'])
def get_dataset_data():
    """Get all data from the plant health dataset"""
    try:
        import pandas as pd
        import os
        
        # Find the plant health dataset
        dataset_files = [f for f in os.listdir(DATA_DIR) if f.endswith('.csv')]
        plant_health_dataset = None
        
        # Look for plant_health_data.csv or similar
        for f in dataset_files:
            if 'plant' in f.lower() and 'health' in f.lower():
                plant_health_dataset = f
                break
        
        if not plant_health_dataset and dataset_files:
            # Use first CSV if no plant health dataset found
            plant_health_dataset = dataset_files[0]
        
        if not plant_health_dataset:
            return jsonify({
                'error': 'No dataset found',
                'message': 'Please upload a dataset first'
            }), 404
        
        dataset_path = os.path.join(DATA_DIR, plant_health_dataset)
        df = pd.read_csv(dataset_path)
        
        # Convert to list of dictionaries
        data = df.to_dict('records')
        
        return jsonify({
            'success': True,
            'data': data,
            'count': len(data),
            'dataset': plant_health_dataset
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to load dataset',
            'details': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/python/auto-predict', methods=['POST'])
def auto_predict_on_entry():
    """Automatically run prediction when new entry is added"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Import the plant health model
        try:
            import sys
            import os
            sys.path.append(SCRIPTS_DIR)
            from plant_health_model import predict
            import pandas as pd
            
            model_path = os.path.join(MODELS_DIR, 'plant_health_model.pt')
            scaler_path = os.path.join(MODELS_DIR, 'scaler.pkl')
            encoder_path = os.path.join(MODELS_DIR, 'label_encoder.pkl')
            
            # Check if model exists
            if not os.path.exists(model_path):
                return jsonify({
                    'error': 'Model not found',
                    'message': 'Please train the model first'
                }), 404
            
            # Convert input data to DataFrame
            if isinstance(data, list):
                df = pd.DataFrame(data)
            else:
                df = pd.DataFrame([data])
            
            # Make predictions
            result = predict(model_path, scaler_path, encoder_path, df)
            
            return jsonify({
                'success': True,
                'predictions': result['predictions'],
                'probabilities': result['probabilities'],
                'classes': result['classes']
            })
            
        except ImportError as e:
            return jsonify({
                'error': 'Could not import model',
                'details': str(e)
            }), 500
        except Exception as e:
            return jsonify({
                'error': 'Prediction failed',
                'details': str(e),
                'traceback': traceback.format_exc()
            }), 500
            
    except Exception as e:
        return jsonify({
            'error': 'Request processing failed',
            'details': str(e)
        }), 500

# ==================== MariaDB Database Endpoints ====================

@app.route('/api/readings', methods=['POST'])
def add_reading():
    """Add a new plant reading to database"""
    try:
        if not db or not db.is_connected():
            return jsonify({
                'success': False,
                'message': 'Database not connected. Please configure MariaDB first.'
            }), 503
        
        data = request.json
        reading_id = db.insert_reading(data)
        if reading_id:
            # Emit to WebSocket clients
            socketio.emit('new_reading', {'id': reading_id, 'data': data})
            
            return jsonify({
                'success': True,
                'message': 'Reading added successfully',
                'id': reading_id
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to add reading'
            }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/readings', methods=['GET'])
def get_readings():
    """Get recent plant readings from database"""
    try:
        if not db or not db.is_connected():
            return jsonify({
                'success': False,
                'message': 'Database not connected. Please configure MariaDB first.',
                'data': []
            }), 503
        
        limit = request.args.get('limit', 100, type=int)
        plant_id = request.args.get('plant_id', type=int)
        readings = db.get_recent_readings(limit, plant_id)
        return jsonify({
            'success': True,
            'data': readings,
            'count': len(readings)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get plant statistics from database"""
    try:
        if not db or not db.is_connected():
            return jsonify({
                'success': False,
                'message': 'Database not connected. Please configure MariaDB first.',
                'data': []
            }), 503
        
        plant_id = request.args.get('plant_id', type=int)
        stats = db.get_plant_statistics(plant_id)
        return jsonify({
            'success': True,
            'data': stats
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/api/project-readings', methods=['GET'])
def get_project_readings():
    """Recent rows from project_readings (Arduino nine-field CSV pipeline)."""
    try:
        if not db or not db.is_connected():
            return jsonify({
                'success': False,
                'message': 'Database not connected. Please configure MariaDB first.',
                'data': [],
                'count': 0
            }), 503
        limit = request.args.get('limit', 100, type=int)
        limit = min(max(limit, 1), 500)
        rows = db.get_recent_project_readings(limit)
        return jsonify({
            'success': True,
            'data': rows,
            'count': len(rows)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/api/sensor/live', methods=['GET'])
def sensor_live():
    """Snapshot for the React UI: project_readings, plant_readings, and latest row."""
    try:
        if not db or not db.is_connected():
            return jsonify({
                'success': False,
                'message': 'Database not connected. Please configure MariaDB first.',
                'project_readings': [],
                'plant_readings': [],
                'latest': None,
                'primary_source': None
            }), 503

        limit = request.args.get('limit', 50, type=int)
        limit = min(max(limit, 1), 500)
        project_rows = db.get_recent_project_readings(limit)
        plant_rows = db.get_recent_readings(limit)
        latest = None
        primary = None
        if project_rows:
            latest = project_rows[0]
            primary = 'project_readings'
        elif plant_rows:
            latest = plant_rows[0]
            primary = 'plant_readings'

        return jsonify({
            'success': True,
            'project_readings': project_rows,
            'plant_readings': plant_rows,
            'latest': latest,
            'primary_source': primary,
            'counts': {
                'project_readings': len(project_rows),
                'plant_readings': len(plant_rows)
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# ==================== WebSocket Events ====================

@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection"""
    print('Client connected')
    emit('connected', {'status': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    print('Client disconnected')

@socketio.on('hardware_data')
def handle_hardware_data(data):
    """Handle incoming hardware sensor data"""
    try:
        # Store in database if available
        if db and db.is_connected():
            reading_id = db.insert_reading(data)
            if reading_id:
                data['id'] = reading_id
        
        # Broadcast to all connected clients
        socketio.emit('sensor_update', data)
    except Exception as e:
        print(f"Error handling hardware data: {e}")
        emit('error', {'message': str(e)})

if __name__ == '__main__':
    # Create directories if they don't exist
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(SCRIPTS_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    print(f"Starting Flask server...")
    print(f"Data directory: {DATA_DIR}")
    print(f"Scripts directory: {SCRIPTS_DIR}")
    print(f"Models directory: {MODELS_DIR}")
    print(f"Server will run on http://localhost:5000")
    print(f"WebSocket server will run on ws://localhost:5000")
    
    if db and db.is_connected():
        print("✅ MariaDB database connected")
    else:
        print("⚠️ MariaDB database not connected (optional)")
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)

