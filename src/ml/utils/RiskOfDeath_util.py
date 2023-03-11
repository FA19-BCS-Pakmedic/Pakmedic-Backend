import pickle
import numpy as np


def predict(userData):
  filename = 'ML_models/RiskOfDeathModel.sav'
  loaded_model = pickle.load(open(filename, 'rb'))

  print(userData)

  response  = loaded_model.predict([userData])

  return response
