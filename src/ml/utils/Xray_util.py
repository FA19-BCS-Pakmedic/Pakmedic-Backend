import random

import cv2
import matplotlib.pyplot as plt
import numpy as np
from keras import backend as K
from keras.preprocessing import image
from sklearn.metrics import roc_auc_score, roc_curve
from tensorflow.compat.v1.logging import INFO, set_verbosity
import os
import io
import base64
from keras.models import load_model
from PIL import Image

random.seed(a=None, version=2)

set_verbosity(INFO)

def fig2img(fig):
    """Convert a Matplotlib figure to a PIL Image and return it"""
    buf = io.BytesIO()
    fig.savefig(buf, bbox_inches='tight')
    buf.seek(0)
    buffer  = base64.b64encode(buf.read())
    return buffer 

def load_image(img, image_dir, preprocess=True, H=320, W=320):
    """Load and preprocess image."""
    mean, std = np.array([126.36159873046876,62.057687051276915])
    img_path = os.path.join(image_dir, img)
    x = image.load_img(img_path, target_size=(H, W))
    if preprocess:
        print("inside preprocess")
        x -= mean
        x /= std
        x = np.expand_dims(x, axis=0)
    return x

def grad_cam(input_model, image, cls, layer_name, H=320, W=320):
    """GradCAM method for visualizing input saliency."""
    y_c = input_model.output[0, cls]
    conv_output = input_model.get_layer(layer_name).output
    grads = K.gradients(y_c, conv_output)[0]

    gradient_function = K.function([input_model.input], [conv_output, grads])

    output, grads_val = gradient_function([image])
    output, grads_val = output[0, :], grads_val[0, :, :, :]

    weights = np.mean(grads_val, axis=(0, 1))
    cam = np.dot(output, weights)

    # Process CAM
    cam = cv2.resize(cam, (W, H), cv2.INTER_LINEAR)
    cam = np.maximum(cam, 0)
    cam = cam / cam.max()
    return cam

def compute_gradcam(model, img, image_dir, labels, selected_labels,
                    layer_name='bn'):
    preprocessed_input = load_image(img, image_dir)
    predictions = model.predict(preprocessed_input)

    print("Loading original image")
    plt.figure(figsize=(15, 10))
    plt.subplot(2,3,1)
    plt.title("Original",fontsize=20)
    plt.axis('off')
    plt.imshow(load_image(img, image_dir, preprocess=False), cmap='gray')

    j = 1
    for i in range(len(labels)):
        if labels[i] in selected_labels:
            print(f"Generating gradcam for class {labels[i]}")
            gradcam = grad_cam(model, preprocessed_input, i, layer_name)
            plt.subplot(2,3,1 + j)
            plt.title(f"{labels[i]}: p={predictions[0][i]:.3f}",fontsize=20)
            plt.axis('off')
            plt.imshow(load_image(img, image_dir, preprocess=False),
                       cmap='gray')
            plt.imshow(gradcam, cmap='jet', alpha=min(0.5, predictions[0][i]))
            j += 1

    fig = plt.gcf()
    buf = fig2img(fig)
    return buf

