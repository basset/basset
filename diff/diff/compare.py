import cv2
import numpy as np

DIFF_COLOR = [30, 30, 255, 255]
ALPHA_COLOR = [0, 0, 0, 0]


def compare(old_snapshot, new_snapshot):
    old_snapshot_image = np.asarray(
        bytearray(old_snapshot.read()), dtype=np.uint8)
    old_snapshot.close()
    new_snapshot_image = np.asarray(
        bytearray(new_snapshot.read()), dtype=np.uint8)
    img1 = cv2.imdecode(old_snapshot_image, cv2.IMREAD_UNCHANGED)
    img2 = cv2.imdecode(new_snapshot_image, cv2.IMREAD_UNCHANGED)

    row = img1.shape[0] - img2.shape[0]
    col = img1.shape[1] - img2.shape[1]

    if row > 0:
        img2 = cv2.copyMakeBorder(img2, 0, row, 0, 0, cv2.BORDER_CONSTANT,
                                  value=[0, 0, 0, 0])
    if col > 0:
        img2 = cv2.copyMakeBorder(img2, 0, 0, 0, col, cv2.BORDER_CONSTANT,
                                  value=[0, 0, 0, 0])
    if row < 0:
        img1 = cv2.copyMakeBorder(img1, 0, abs(row), 0, 0, cv2.BORDER_CONSTANT,
                                  value=[0, 0, 0, 0])
    if col < 0:
        img1 = cv2.copyMakeBorder(img1, 0, 0, 0, abs(col), cv2.BORDER_CONSTANT,
                                  value=[0, 0, 0, 0])

    diff_data = cv2.absdiff(img1, img2)
    color_diff = np.mean(diff_data, axis=2)
    mse = np.float64(np.sqrt((diff_data ** 2).mean())).item()
    thresh = 10
    diff_data[:, :, :4][color_diff <= thresh] = ALPHA_COLOR
    diff_data[:, :, :4][color_diff > thresh] = DIFF_COLOR

    diff_pixel_count = np.sum(diff_data == [DIFF_COLOR[1], None, None, None])

    _, diff_image = cv2.imencode('.png', diff_data)
    return diff_image, mse, diff_pixel_count
