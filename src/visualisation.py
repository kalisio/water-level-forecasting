import math
import matplotlib.pyplot as plt
import numpy as np
from .data import denormalize

# Used to plot training/validation loss or accuracy
def plot_train_metric(history, title, metric):
  train_metric = history.history[metric]
  validation_metric = history.history['val_' + metric]
  epochs = range(len(train_metric))

  plt.plot(epochs, train_metric, 'b', label='Training')
  plt.plot(epochs, validation_metric, 'r', label='Validation')
  plt.title(title)
  plt.xlabel('Epochs')
  plt.legend()

# Used to plot input window/label and prediction in single-step setup
def show_single_plot(history, true_future, offset, prediction, title, mean, std):
  # Past data are before 0
  num_in = list(range(-len(history), 0))
  # Then prediction after 0
  num_out = np.array([offset])

  plt.title(title)
  plt.plot(num_in, np.array(denormalize(history, mean, std)), label='History')
  plt.plot(num_out, np.array(denormalize(true_future, mean, std)), 'bo',
           label='True Future')
  if prediction:
    plt.plot(num_out, np.array(denormalize(prediction, mean, std)), 'ro',
             label='Predicted Future')
  plt.legend(loc='upper left')
  plt.xlabel("Time Step")
  plt.ylabel("Water level (mm)")

# Used to plot input window/label and prediction in multiple-step setup
def show_multiple_plot(history, true_future, prediction, title, mean, std):
  # Past data are before 0
  num_in = list(range(-len(history), 0))
  # Then prediction after 0
  num_out = np.arange(len(true_future))

  plt.title(title)
  plt.plot(num_in, np.array(denormalize(history, mean, std)), label='History')
  plt.plot(num_out, np.array(denormalize(true_future, mean, std)), 'bo',
           label='True Future')
  if prediction:
    plt.plot(num_out, np.array(denormalize(prediction, mean, std)), 'ro',
             label='Predicted Future')
  plt.legend(loc='upper left')
  plt.xlabel("Time Step")
  plt.ylabel("Water level (mm)")
    
# Used to plot raw data vs model data (i.e. prediction)
# Also compute different errors
def show_prediction(data, prediction, title):
  if data:
    time_steps = list(range(0, len(data)))
  else:
    time_steps = list(range(0, len(prediction)))
  plt.title(title)
  if data:
    plt.plot(time_steps, np.array(data), '-', label='Data')
  if prediction:
    plt.plot(time_steps, np.array(prediction), '-', label='Model Prediction')
  plt.legend()
  plt.xlabel("Time Step")
  plt.ylabel("Water level (mm)")
  
  mae = np.absolute(np.subtract(data,prediction)).mean()
  print ('Mean Absolute Error {:4.2f}'.format(mae))
  mae = np.max(np.subtract(data,prediction))
  print ('Max Absolute Error {:4.2f}'.format(mae))
  mape = np.absolute(np.divide(np.subtract(data,prediction), data)).mean()
  print ('Mean Absolute Percentage Error {:4.2f}%'.format(100*mape))
  mape = np.max(np.absolute(np.divide(np.subtract(data,prediction), data)))
  print ('Max Absolute Percentage Error {:4.2f}%'.format(100*mape))
  mse = np.square(np.subtract(data,prediction)).mean()
  print ('Mean Squared Error {:4.2f}'.format(mse))
  print ('Root Mean Squared Error {:4.2f}'.format(math.sqrt(mse)))