import numpy as np
import tensorflow as tf
from .data import normalize, denormalize

# Fit a RNN on given datasets
def fitRNN (x_train, y_train, x_validate, y_validate, outputs = 1,
            batch_size = 128, buffer_size = 5000, epochs = 10, steps_per_epoch = 100, validation_steps = 50):
  train = tf.data.Dataset.from_tensor_slices((x_train, y_train))
  train = train.cache().shuffle(buffer_size).batch(batch_size).repeat()

  validate = tf.data.Dataset.from_tensor_slices((x_validate, y_validate))
  validate = validate.batch(batch_size).repeat()

  model = tf.keras.models.Sequential()
  model.add(tf.keras.layers.LSTM(16, return_sequences=True, input_shape=x_train.shape[-2:]))
  model.add(tf.keras.layers.LSTM(8, activation='relu'))
  model.add(tf.keras.layers.Dense(outputs))

  model.compile(optimizer='adam', loss='mae', metrics=['mse'])

  return (model, model.fit(train, epochs=epochs, steps_per_epoch=steps_per_epoch,
                           validation_data=validate, validation_steps=validation_steps))

# Predict a single output using a RNN model based on an input history window
def predictRNN (model, window, mean, std):
  x = []
  x.append(normalize(window, mean, std))
  x = np.array(x)
  x = np.reshape(x, (x.shape[0], x.shape[1], 1))
  return denormalize(model.predict(x)[0][0], mean, std)

# Make prediction with a RNN model over input data based on history window in a given range
def predictRangeRNN(model, data, history, start, end, mean, std):
  ground_truth = []
  prediction = []
  for i in range(start, end):
      ground_truth.append(data.values[i])
      prediction.append(predictRNN(model, data.values[i-history:i], mean, std))
  return ground_truth, prediction