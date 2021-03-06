import { createFocusTrap}  from './vendor.js'

const anchors = document.querySelectorAll('.main-block__description a[href*="#"]');
const buttonOpen = document.querySelector('.navigation__button');
const modal = document.querySelector('.modal');
const buttonClose = document.querySelector('.modal__close');
const overlay = document.querySelector('.overlay');
const buttonSection = document.querySelector('.footer-navigation__section-block');
const buttonSectionToggle = document.querySelector('.footer-navigation__section-button')
const sectionList = document.querySelector('.footer-navigation__section-list');
const buttonOfice = document.querySelector('.footer-navigation__ofice-block');
const buttonOficeToogle = document.querySelector('.footer-navigation__section-button--ofice');
const oficeList = document.querySelector('.footer-navigation__ofice-list');
const navigationSectionNojs = document.querySelector('.footer-navigation__section-list');
const navigationOficeNojs = document.querySelector('.footer-navigation__ofice-list');
const feedbackInput = document.querySelector('#feedback__input');
const feedbackLabel = document.querySelector('.feedback__label');
const feedbackInputTell = document.querySelector('#feedback__tell');
const feedbackLabelTell = document.querySelector('.feedback__label--tell');
const feedbackInputText = document.querySelector('#feedback__text');
const feedbackLabelText = document.querySelector('.feedback__label--text');
const modalInputName = document.querySelector('#modal__name');
const modalInputTell = document.querySelector('#modal__tell');
const modalInputText = document.querySelector('#modal__text');
const modalLabelName = document.querySelector('.modal__label--name');
const modalLabelTell = document.querySelector('.modal__label--tell');
const modalLabelText = document.querySelector('.modal__label--text');
const pageBody = document.querySelector('.page-body');
const modalName = document.querySelector('#modal__name');
const modalFocusTrap = createFocusTrap(".modal");

feedbackInput.addEventListener('keyup', function (evt) {
  feedbackLabel.classList.add('feedback__label--none');
  if (feedbackInput.value == '' ) {
    feedbackLabel.classList.remove('feedback__label--none');
  }
})

feedbackInputText.addEventListener('keyup', function (evt) {
  feedbackLabelText.classList.add('feedback__label--none');
  if (feedbackInputText.value == '' ) {
    feedbackLabelText.classList.remove('feedback__label--none');
  };
})

navigationSectionNojs.classList.remove('footer-navigation__section-list--nojs');

navigationOficeNojs.classList.remove('footer-navigation__ofice-list--nojs');

overlay.addEventListener('click', function (evt) {
  evt.preventDefault();
  modal.classList.remove('modal__open')
  overlay.classList.remove('overlay__active');
  pageBody.classList.remove('page-body--hiden');
  modalFocusTrap.deactivate();
})

window.addEventListener('keydown', function (evt) {
  if (evt.keyCode === 27) {
    evt.preventDefault();
    modal.classList.remove('modal__open');
    overlay.classList.remove('overlay__active');
    pageBody.classList.remove('page-body--hiden');
    modalFocusTrap.deactivate();
  }
})

for (let anchor of anchors) {
  anchor.addEventListener('click', function (e) {
    e.preventDefault()

    const blockID = anchor.getAttribute('href').substr(1)

    document.getElementById(blockID).scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  })
}

buttonSection.onclick = () => {
  sectionList.classList.toggle('footer-navigation--visible');
  buttonSectionToggle.classList.toggle('footer-navigation__section-button--toogle');
  buttonOficeToogle.classList.remove('footer-navigation--visible');
  buttonOficeToogle.classList.remove('footer-navigation__section-button-toggleofice');
}

buttonOfice.onclick = () => {
  oficeList.classList.toggle('footer-navigation--visible');
  buttonOficeToogle.classList.toggle('footer-navigation__section-button-toggleofice');
  sectionList.classList.remove('footer-navigation--visible');
  buttonSectionToggle.classList.remove('footer-navigation__section-button--toogle');
}

const feedbackLength = document.querySelector('#feedback__tell');
const minFeedbackLentgh = 17;

feedbackLength.addEventListener('input', () => {
  const valueLength = feedbackLength.value.length;

  if (valueLength <minFeedbackLentgh) {
    feedbackLength.setCustomValidity('?????????? ???????????? ???????????????? ???? ???????????? ????????????????')
  } 
  else {
    feedbackLength.setCustomValidity('');
  }
  feedbackLength.reportValidity();
});

const modalLength = document.querySelector('#modal__tell');

modalLength.addEventListener('input', () => {
  const valueLength = modalLength.value.length;

  if (valueLength <minFeedbackLentgh) {
    modalLength.setCustomValidity('?????????? ???????????? ???????????????? ???? ???????????? ????????????????')
  } 
  else {
    modalLength.setCustomValidity('');
  }
  modalLength.reportValidity();
});


window.addEventListener('DOMContentLoaded', function() {
  [].forEach.call( document.querySelectorAll('#feedback__tell'), function(input) {
    let keyCode;
    function mask(event) {
      event.keyCode && (keyCode = event.keyCode);
      let pos = this.selectionStart;
      if (pos < 3) event.preventDefault();
      let matrix = '+7 (___) ___ ____',
        i = 0,
        def = matrix.replace(/\D/g, ''),
        val = this.value.replace(/\D/g, ''),
        new_value = matrix.replace(/[_\d]/g, function(a) {
          return i < val.length ? val.charAt(i++) || def.charAt(i) : a
        });
      i = new_value.indexOf('_');
      if (i != -1) {
          i < 5 && (i = 3);
          new_value = new_value.slice(0, i)
      }
      let reg = matrix.substr(0, this.value.length).replace(/_+/g,
          function(a) {
              return '\\d{1,' + a.length + '}'
          }).replace(/[+()]/g, '\\$&');
      reg = new RegExp('^' + reg + '$');
      if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) this.value = new_value;
      if (event.type == 'blur' && this.value.length < 5)  this.value = ''
    }

    input.addEventListener('input', mask, false);
    input.addEventListener('focus', mask, false);
    input.addEventListener('keydown', mask, false) 
  });
  [].forEach.call( document.querySelectorAll('#modal__tell'), function(input) {
    let keyCode;
    function mask(event) {
      event.keyCode && (keyCode = event.keyCode);
      let pos = this.selectionStart;
      if (pos < 3) event.preventDefault();
      let matrix = '+7 (___) ___ ____',
        i = 0,
        def = matrix.replace(/\D/g, ''),
        val = this.value.replace(/\D/g, ''),
        new_value = matrix.replace(/[_\d]/g, function(a) {
          return i < val.length ? val.charAt(i++) || def.charAt(i) : a
        });
      i = new_value.indexOf('_');
      if (i != -1) {
          i < 5 && (i = 3);
          new_value = new_value.slice(0, i)
      }
      let reg = matrix.substr(0, this.value.length).replace(/_+/g,
          function(a) {
              return '\\d{1,' + a.length + '}'
          }).replace(/[+()]/g, '\\$&');
      reg = new RegExp('^' + reg + '$');
      if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) this.value = new_value;
      if (event.type == 'blur' && this.value.length < 5)  this.value = ''
    }

    input.addEventListener('input', mask, false);
    input.addEventListener('focus', mask, false);
  });
});

feedbackInputTell.addEventListener('keyup', function (evt) {
  feedbackLabelTell.classList.add('feedback__label--none');
  if (feedbackLabelTell.value == '' ) {
    feedbackLabelTell.classList.remove('feedback__label--none');
  }
})

buttonOpen.addEventListener('click', function (evt) {
  evt.preventDefault();
  modal.classList.add('modal__open');
  overlay.classList.add('overlay__active');
  pageBody.classList.add('page-body--hiden');
  modalName.focus();
  modalFocusTrap.activate();
});

buttonClose.addEventListener('click', function (evt) {
  evt.preventDefault();
  modal.classList.remove('modal__open')
  overlay.classList.remove('overlay__active');
  pageBody.classList.remove('page-body--hiden');
  modalFocusTrap.deactivate();
});

modalInputName.addEventListener('keyup', function (evt) {
  modalLabelName.classList.add('feedback__label--none');
  if (modalInputName.value == '' ) {
    modalLabelName.classList.remove('feedback__label--none');
  }
})

modalInputTell.addEventListener('keyup', function (evt) {
  modalLabelTell.classList.add('feedback__label--none');
  if (modalInputTell.value == '' ) {
    modalLabelTell.classList.remove('feedback__label--none');
  }
})

modalInputText.addEventListener('keyup', function (evt) {
  modalLabelText.classList.add('feedback__label--none');
  if (modalInputText.value == '' ) {
    modalLabelText.classList.remove('feedback__label--none');
  }
})
