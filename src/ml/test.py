from flask import Flask,request
import sys
import json

app = Flask(__name__)

sys.path.insert(0, r'utils')

from utils import Xray_util as util
from utils import Retinopathy_util as retinopathy

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
    model = util.load_model('ML_models/Xray_model', compile=False)

    buffer = util.compute_gradcam(model, 'cardiomegaly.png', IMAGE_DIR, labels, to_show)

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
        response = "You have been diagonsed with Retinopathy"
    else : 
        response = "You have not been diagonsed with Diabetic Retinopathy"

    return response

    
if __name__ == "__main__":
    app.run(port=5000, debug=True)