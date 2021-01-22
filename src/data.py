import pandas as pd
import numpy as np

def read_raw_data (file):
  raw = pd.read_csv(file, delimiter=';')
  data = raw['resultat_obs']
  data.index = raw['date_obs']
  return data

# Used to normalize/denormalize data
def normalize(data, mean, std):
  return (data - mean) / std

def denormalize(data, mean, std):
  return data * std + mean
  
def data_windows(dataset, history_size, target_size, single_step=False):
  data = []
  labels = []
  # We cannot extract window if less than history_size past data available
  start_index = history_size
  # We cannot extract label(s) if less than target_size data ahead
  end_index = len(dataset) - target_size

  for i in range(start_index, end_index):
    # Range is past window size from current index
    indices = range(i-history_size, i)
    # Reshape data from (history_size,) to (history_size, 1)
    data.append(np.reshape(dataset[indices], (history_size, 1)))
    # Push single or multiple label(s)
    if single_step:
      labels.append(dataset[i+target_size])
    else:
      labels.append(dataset[i:i+target_size])
    
  return np.array(data), np.array(labels)