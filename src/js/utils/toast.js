import toastr from 'toastr';

/**
 * @param {string} message
 */
export const toastError = (message) => {
  toastr.error(message, '', {
    closeButton:   true,
    positionClass: 'toast-bottom-center'
  });
};

/**
 * @param {string} message
 */
export const toastSuccess = (message) => {
  toastr.success(message, '', {
    closeButton:   true,
    positionClass: 'toast-bottom-center'
  });
};
