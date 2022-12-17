from flask import Flask
import sys

app = Flask(__name__)

sys.path.insert(0, r'utils')

from utils import Xray_util as util
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
    model = util.load_model('ML-models/Xray_model', compile=False)

    buffer = util.compute_gradcam(model, 'cardiomegaly.png', IMAGE_DIR, labels, to_show)

    # base = BytesIO(base64.decodebytes(buffer))
    # img = Image.open(base)
    # img.show()

    return buffer

if __name__ == "__main__":
    app.run(port=5000, debug=True)