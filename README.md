# Timeseries forecasting use case: level of water

> Based on Open Data provided by Hub'Eau and largely inspired by https://www.tensorflow.org/tutorials/structured_data/time_series

Predicting the level of water in rivers can prove to be invaluable in areas with a high risk of flooding. While traditional methods are based primarily on physical model, another approach is emerging: artificial neural networks.

This experiment is using TensorFlow and Long Short-Term Memory Recurrent Neural Networks. We would also like to have a look to https://facebook.github.io/prophet/.

Background: research has shown that some weather parameters can be accurately predicted out to 72hrs using a 15 year data period of hourly measurements, why not water level ?

## Data gathering

Simply run `yarn install` then `node hubeau_data.js "River label"`, it will gather all required data for the experiment on the target river in the `data` directory:
* list of sites (ie measurement stations) of interested for the target river (eg "L'Aude")
* bydefault 1 month past data of measurements on each previously selected site with a time step of 30 minutes

You can also use the following additional options:
* `--output` output directory (defaults to 'data')
* `--timestep` time step in minutes (min 10 - max 60 - defaults 30)
* `--timerange` past time range in days (min 1 - max 30 - defaults 30)

> **All data zip files are to be extracted into the :open_file_folder: [data/raw](./data/raw)directory**

### Base data

Default data for training ([train_data.zip](./train_data.zip)) are provided from 07-01-2020 to 07-02-2020 for some rivers in Occitanie - France, which is an interesting period because a flood episode has occured from 22-01 to 25-01.

Some validation data ([validation_data.zip](./validation_data.zip)) are also provided from 15-04-2020 to 15-05-2020 for some rivers in Occitanie - France, which is also an interesting period because smaller but intense precipitations episodes have occured.

> Please note that data at some stations were missing during this period

Concerning the meteo station data ([train_meteo_data.zip](./train_meteo_data.zip) and [validation_meteo_data.zip](./validation_meteo_data.zip)) we retrieved archived data on these periods from https://rp5.ru/ manually but data are really scrace.

### Complementary data

Additional data ([test_data.zip](./test_data.zip)) are provided from 26-08-2020 to 26-09-2020 for some rivers in Occitanie - France, which is also an interesting period because a huge flood episode has occured from 19-09 to 20-09.

During this flood episode we gathered meteo station data ([test_meteo_data.zip](./test_meteo_data.zip)) from the dense RADOME network.

However, we did not make use of this data yet. Let us know if you have by opening an issue.

## Data processing and model training

There are two different notebooks located in the :open_file_folder: [notebooks](./notebooks) folder:
* [hubeau_univariate](./notebooks/hubeau_univariate.ipynb) where a single variable, ie the water level given by the station, is used at a given station to make predictions
* [hubeau_multivariate](./notebooks/hubeau_multivariate.ipynb) where multiple variables, ie the water level given by others stations or meteo stations, is used at a given station to make predictions - **Work in progress**

We use Anaconda distribution for simplicity and create a TensorFlow environment for our experiment:
```
conda create -n tf-gpu tensorflow-gpu
conda activate tf-gpu
conda install matplotlib
conda install pandas
conda install jupyter notebook
```

Launch the notebooks using `jupyter notebook hubeau_univariate.ipynb` or `jupyter notebook hubeau_multivariate.ipynb`.

## License

Copyright (c) 2017-20xx Kalisio

Licensed under the [MIT license](LICENSE).
