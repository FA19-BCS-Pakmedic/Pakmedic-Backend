import pickle
import numpy as np


def predict(userData):
  filename = 'ML_models/RetinopathyModel.sav'
  loaded_model = pickle.load(open(filename, 'rb'))

  mean =  [4.091386 , 4.607175 , 4.499730 , 4.606881]
  stdev = [0.141238 , 0.105746 , 0.106699 , 0.103411]

  #input Values in the following order AGE, Systolic BP, Diastolic BP, Cholestrol Value
  data = np.log(userData)
  data = (data-mean)/stdev

  ageXSystolic = data[0]*data[1]
  ageXDiastolic = data[0]*data[2]
  ageXCholestrol = data[0]*data[3]
  SystolicxDiastolic = data[1]*data[2]
  SystolicxCholesterol = data[1]*data[3]
  DiastolicxCholesterol = data[2]*data[3]

  interactions = np.array([ageXSystolic,ageXDiastolic,ageXCholestrol,SystolicxDiastolic,SystolicxCholesterol,DiastolicxCholesterol])

  datanew = np.concatenate([data,interactions])

  response  = loaded_model.predict([datanew])

  return response
