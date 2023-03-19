from flask import Flask,request
import sys
import json

app = Flask(__name__)

sys.path.insert(0, r'utils')

from utils import Xray_util as util
from utils import Retinopathy_util as retinopathy
from utils import RiskOfDeath_util as riskOfDeath
from utils import RecommendCompound_util as recommendCompound
from utils import BrainMRI_util as mriUtil


import numpy as np

IMAGE_DIR = "sample_ChestXray"

labels = ['Cardiomegaly', 
        'Emphysema', 
        'Effusion', 
        'Hernia', 
        'Infiltration', 
        'Mass', 
        'Nodule', 
        'Atelectasis',
        'Pneumothorax',
        'Pleural_Thickening', 
        'Pneumonia', 
        'Fibrosis', 
        'Edema', 
        'Consolidation']

to_show = np.array(['Cardiomegaly', 'Edema', 'Mass', 'Pneumothorax'])



@app.route('/flask', methods=['GET'])
def flask():
    return "Flask server"

@app.route('/chestXray', methods=['GET'])
def xray():
    # load model

    file = request.query_string.decode('utf-8')
    
    model = util.load_model('ML_models/Xray_model', compile=False)

    buffer = util.compute_gradcam(model, file, IMAGE_DIR, labels, to_show)

    # base = BytesIO(base64.decodebytes(buffer))
    # img = Image.open(base)
    # img.show()

    return buffer


@app.route('/brainMRI', methods=['GET'])
def mri():
    file = request.query_string.decode('utf-8')

    buffer = mriUtil.results(file)

    # base = BytesIO(base64.decodebytes(buffer))
    # img = Image.open(base)
    # img.show()
    return buffer

@app.route('/retinopathy', methods=['GET'])
def Retinopathy():
    json  = request.get_json() 

    data = json['user']

    res = retinopathy.predict(data)

    if(res==1):
        response = "The Patient has been diagonsed with Diabetic Retinopathy"
    else : 
        response = "The Patient has not been diagonsed with Diabetic Retinopathy"

    return response

@app.route('/riskOfDeath', methods=['GET'])
def RiskOfDeath():
    json  = request.get_json() 

    data = json['user']

    res = riskOfDeath.predict(data)

    if(res==1):
        response = "The Patient is at Risk of Death"
    else : 
        response = "The Patient is not at Risk of Death"

    return response


@app.route('/recommendcompound', methods=['GET'])
def RecommendCompound():
    json  = request.get_json() 

    data = json['conditions']


    res = recommendCompound.predict(data)


    return res
    
if __name__ == "__main__":
    app.run(port=5000, debug=True)