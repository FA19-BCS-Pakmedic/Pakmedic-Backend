import pandas as pd
import json

def predict(conditions):
  # Read the Excel file into a DataFrame
  df = pd.read_csv('utils/results.csv',header=0 , encoding='utf-8')

  df = df.groupby(['condition','drugName']).agg({'total_pred' : ['mean']})

  df = df.sort_values(by=('total_pred', 'mean'), ascending=False).groupby('condition', group_keys=False).apply(lambda x: x.sort_values(by=('total_pred', 'mean'), ascending=False))

  df = df.reset_index()

  # conditions = ['Acne', 'ADHD', 'Actinic Keratosis']

  drug_dict = {}
  for condition in conditions:
      df_condition = df[df['condition'] == condition]
      drug_array = df_condition['drugName'].head(5).to_numpy()
      drug_dict[condition] = drug_array.tolist()

  json_output = json.dumps(drug_dict)

  return json_output