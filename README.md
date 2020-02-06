# Timeseries forecasting use case: level of water

> Based on Open Data provided by Hub'Eau and largely inspired by https://www.tensorflow.org/tutorials/structured_data/time_series

Predicting the level of water in rivers can prove to be invaluable in areas with a high risk of flooding. While traditional methods are based primarily on physical model, another approach is emerging: artificial neural networks.

This experiment is using TensorFlow and Long Short-Term Memory Recurrent Neural Networks.

Background: research has shown that some weather parameters can be accurately predicted out to 72hrs using a 15 year data period of hourly measurements, why not water levels ?

## Data gathering

Simply run `yarn install` then `npm run data "L'Aude"`, it will gather all required data for the experiment on the target river:
* list of sites (ie measurement stations) of interested for the target river (eg "L'Aude")
* 1 month past data of measurements on each previously selected site with a timestep of 30

## Data processing

We will use Anaconda distribution for simplicity and create a TensorFlow environment for our experiment:
```
conda create -n tf-gpu tensorflow-gpu
conda activate tf-gpu
conda install matplotlib
conda install pandas
conda install jupyter notebook
```

Launch the notebooks using `jupyter notebook hubeau_univariate` or `jupyter notebook hubeau_multivariate`

## License

Copyright (c) 2017 Kalisio

Licensed under the [MIT license](LICENSE).
