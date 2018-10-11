from tensorflow import keras
from tensorflow.keras.models import load_model

import tensorflowjs as tfjs

print(keras.__version__)

model = load_model("keras.h5")

print(model.summary())

tfjs.converters.save_keras_model(model, artifacts_dir="model")