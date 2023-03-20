import cv2
import h5py
import imageio
import keras
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
# from IPython.display import Image
from keras import backend as K
from keras.engine import Input, Model
from keras.layers import (
    Activation,
    Conv3D,
    Deconvolution3D,
    MaxPooling3D,
    UpSampling3D,
)
from keras.layers.merge import concatenate
from keras.optimizers import Adam
from keras.utils import to_categorical
from tensorflow.compat.v1.logging import INFO, set_verbosity
import numpy as np
import nibabel as nib
# import MRI_util as util
import base64
from PIL import Image
import io

set_verbosity(INFO)

K.set_image_data_format("channels_first")


def fig2img(fig):
    """Convert a Matplotlib figure to a PIL Image and return it"""
    buf = io.BytesIO()
    fig.savefig(buf, bbox_inches='tight')
    buf.seek(0)
    buffer  = base64.b64encode(buf.read())
    return buffer 


def get_up_convolution(n_filters, pool_size, kernel_size=(2, 2, 2),
                    strides=(2, 2, 2),
                    deconvolution=False):
    if deconvolution:
        return Deconvolution3D(filters=n_filters, kernel_size=kernel_size,
                            strides=strides)
    else:
        return UpSampling3D(size=pool_size)


def create_convolution_block(input_layer, n_filters, batch_normalization=False,
                            kernel=(3, 3, 3), activation=None,
                            padding='same', strides=(1, 1, 1),
                            instance_normalization=False):
    """
    :param strides:
    :param input_layer:
    :param n_filters:
    :param batch_normalization:
    :param kernel:
    :param activation: Keras activation layer to use. (default is 'relu')
    :param padding:
    :return:
    """
    layer = Conv3D(n_filters, kernel, padding=padding, strides=strides)(
        input_layer)
    if activation is None:
        return Activation('relu')(layer)
    else:
        return activation()(layer)


def unet_model_3d(loss_function, input_shape=(4, 160, 160, 16),
                pool_size=(2, 2, 2), n_labels=3,
                initial_learning_rate=0.00001,
                deconvolution=False, depth=4, n_base_filters=32,
                include_label_wise_dice_coefficients=False, metrics=[],
                batch_normalization=False, activation_name="sigmoid"):
    """
    Builds the 3D UNet Keras model.f
    :param metrics: List metrics to be calculated during model training (default is dice coefficient).
    :param include_label_wise_dice_coefficients: If True and n_labels is greater than 1, model will report the dice
    coefficient for each label as metric.
    :param n_base_filters: The number of filters that the first layer in the convolution network will have. Following
    layers will contain a multiple of this number. Lowering this number will likely reduce the amount of memory required
    to train the model.
    :param depth: indicates the depth of the U-shape for the model. The greater the depth, the more max pooling
    layers will be added to the model. Lowering the depth may reduce the amount of memory required for training.
    :param input_shape: Shape of the input data (n_chanels, x_size, y_size, z_size). The x, y, and z sizes must be
    divisible by the pool size to the power of the depth of the UNet, that is pool_size^depth.
    :param pool_size: Pool size for the max pooling operations.
    :param n_labels: Number of binary labels that the model is learning.
    :param initial_learning_rate: Initial learning rate for the model. This will be decayed during training.
    :param deconvolution: If set to True, will use transpose convolution(deconvolution) instead of up-sampling. This
    increases the amount memory required during training.
    :return: Untrained 3D UNet Model
    """
    inputs = Input(input_shape)
    current_layer = inputs
    levels = list()

    # add levels with max pooling
    for layer_depth in range(depth):
        layer1 = create_convolution_block(input_layer=current_layer,
                                        n_filters=n_base_filters * (
                                        2 ** layer_depth),
                                        batch_normalization=batch_normalization)
        layer2 = create_convolution_block(input_layer=layer1,
                                        n_filters=n_base_filters * (
                                        2 ** layer_depth) * 2,
                                        batch_normalization=batch_normalization)
        if layer_depth < depth - 1:
            current_layer = MaxPooling3D(pool_size=pool_size)(layer2)
            levels.append([layer1, layer2, current_layer])
        else:
            current_layer = layer2
            levels.append([layer1, layer2])

    # add levels with up-convolution or up-sampling
    for layer_depth in range(depth - 2, -1, -1):
        up_convolution = get_up_convolution(pool_size=pool_size,
                                            deconvolution=deconvolution,
                                            n_filters=
                                            current_layer._keras_shape[1])(
            current_layer)
        concat = concatenate([up_convolution, levels[layer_depth][1]], axis=1)
        current_layer = create_convolution_block(
            n_filters=levels[layer_depth][1]._keras_shape[1],
            input_layer=concat, batch_normalization=batch_normalization)
        current_layer = create_convolution_block(
            n_filters=levels[layer_depth][1]._keras_shape[1],
            input_layer=current_layer,
            batch_normalization=batch_normalization)

    final_convolution = Conv3D(n_labels, (1, 1, 1))(current_layer)
    act = Activation(activation_name)(final_convolution)
    model = Model(inputs=inputs, outputs=act)

    if not isinstance(metrics, list):
        metrics = [metrics]

    model.compile(optimizer=Adam(lr=initial_learning_rate), loss=loss_function,
                  metrics=metrics)
    return model




# set home directory and data directory
def load_case(image_nifty_file):
    # load the image and label file, get the image content and return a numpy array for each
    image = np.array(nib.load(image_nifty_file).get_fdata())

    return image


# UNQ_C5 (UNIQUE CELL IDENTIFIER, DO NOT EDIT)
def soft_dice_loss(y_true, y_pred, axis=(1, 2, 3), 
                epsilon=0.00001):

    dice_numerator = 2 * K.sum(y_true * y_pred , axis= axis) + epsilon
    dice_denominator = K.sum(y_true ** 2, axis= axis) + K.sum(y_pred ** 2 , axis = axis) + epsilon
    dice_loss = 1 - K.mean(dice_numerator / dice_denominator)

    return dice_loss

# UNQ_C4 (UNIQUE CELL IDENTIFIER, DO NOT EDIT)
def dice_coefficient(y_true, y_pred, axis=(1, 2, 3), 
                    epsilon=0.00001):
    
    dice_numerator = 2 * K.sum(y_true * y_pred , axis = axis) + epsilon
    dice_denominator = K.sum(y_true, axis = axis ) + K.sum(y_pred, axis = axis) + epsilon
    dice_coefficient = K.mean(dice_numerator/dice_denominator)
    
    return dice_coefficient

def predict(image, model, threshold, loc=(100, 100, 50)):
    model_label = np.zeros([3, 320, 320, 160])

    for x in range(0, image.shape[0], 160):
        for y in range(0, image.shape[1], 160):
            for z in range(0, image.shape[2], 16):
                patch = np.zeros([4, 160, 160, 16])
                p = np.moveaxis(image[x: x + 160, y: y + 160, z:z + 16], 3, 0)
                patch[:, 0:p.shape[1], 0:p.shape[2], 0:p.shape[3]] = p
                pred = model.predict(np.expand_dims(patch, 0))
                model_label[:, x:x + p.shape[1],
                y:y + p.shape[2],
                z: z + p.shape[3]] += pred[0][:, :p.shape[1], :p.shape[2],
                                    :p.shape[3]]

    model_label = np.moveaxis(model_label[:, 0:240, 0:240, 0:155], 0, 3)
    
    return model_label

def get_labeled_image(image, label, is_categorical=False):
    if not is_categorical:
        label = to_categorical(label, num_classes=4).astype(np.uint8)

    image = cv2.normalize(image[:, :, :, 0], None, alpha=0, beta=255,
                        norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_32F).astype(
        np.uint8)

    labeled_image = np.zeros_like(label[:, :, :, 1:])

    # remove tumor part from image
    labeled_image[:, :, :, 0] = image * (label[:, :, :, 0])
    labeled_image[:, :, :, 1] = image * (label[:, :, :, 0])
    labeled_image[:, :, :, 2] = image * (label[:, :, :, 0])

    # color labels
    labeled_image += label[:, :, :, 1:] * 255
    return labeled_image

def visualizeModel(image, label, threshold, loc=(100, 100, 50)):
    
    model_label_reformatted1 = np.zeros((240, 240, 155 , 4))
    model_label_reformatted2 = np.zeros((240, 240, 155 , 4))
    model_label_reformatted3 = np.zeros((240, 240, 155 , 4))

    model_label_reformatted1 = to_categorical(label[:,:,:,0], num_classes=4).astype(np.uint8)
    model_label_reformatted2 = to_categorical(label[:,:,:,1], num_classes=4).astype(np.uint8)
    model_label_reformatted3 = to_categorical(label[:,:,:,2], num_classes=4).astype(np.uint8)

    model_label_reformatted1[:, :, :, 1:4] = label[:,:,:,0:3]
    model_label_reformatted2[:, :, :, 1:4] = label[:,:,:,0:3]
    model_label_reformatted3[:, :, :, 1:4] = label[:,:,:,0:3]

    model_labeled_image1 = get_labeled_image(image, model_label_reformatted1, is_categorical=True)
    model_labeled_image2 = get_labeled_image(image, model_label_reformatted2, is_categorical=True)
    model_labeled_image3 = get_labeled_image(image, model_label_reformatted3, is_categorical=True)
    
    fig, ax = plt.subplots(3, 1, figsize=[10, 10])

    # plane values
    x, y, z = loc
    
    # Extract reds from image1
    red_mask = np.zeros_like(model_labeled_image1)
    red_mask[:,:,:,0] = 1
    red_masked_image = np.where(red_mask, model_labeled_image1, 0)

    # Extract greens from image2
    green_mask = np.zeros_like(model_labeled_image2)
    green_mask[:,:,:,1] = 1
    green_masked_image = np.where(green_mask, model_labeled_image2, 0)
    
    
    blue_mask = np.zeros_like(model_labeled_image3)
    blue_mask[:,:,:,2] = 1
    blue_masked_image = np.where(blue_mask, model_labeled_image3, 0)

    # Combine the reds and greens
    overlay_image = red_masked_image + green_masked_image + blue_masked_image

    # Plot the overlay image in all 3 planes
    ax[0].imshow(np.rot90(overlay_image[x, :, :, :]))
    ax[0].set_ylabel('MRI Results', fontsize=15)
    ax[0].set_xlabel('Sagital', fontsize=15)

    ax[1].imshow(np.rot90(overlay_image[:, y, :, :]))
    ax[1].set_xlabel('Coronal', fontsize=15)

    ax[2].imshow(np.squeeze(overlay_image[:, :, z, :]))
    ax[2].set_xlabel('Transversal', fontsize=15)

    fig.subplots_adjust(wspace=.12, hspace=0.2)

    for i in range(3):
        ax[i].set_xticks([])
        ax[i].set_yticks([])

    fig = plt.gcf()
    buf = fig2img(fig)
    return buf
    
#     return model_label_reformatted

def results(file):
    model = unet_model_3d(loss_function=soft_dice_loss, metrics=[dice_coefficient])

    model.load_weights("ML_models/brainMRI_Model.hdf5")

    image1 = load_case("sample_BrainMRI/" + file )

    model_label2 = predict(image1, model, .5, loc=(130, 130, 77))     

    model_visualize2 = visualizeModel(image1,model_label2,.5, loc=(130, 130, 77))

    return model_visualize2





