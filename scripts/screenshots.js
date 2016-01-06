(function() {

  function Screenshots(element) {
    this._element = element;
    this._name = this.readParameter('name');
    this._count = parseInt(this.readParameter('count'));
    this._size = parseDimensions(this.readParameter('size'));
    this._element.innerHTML = '';

    this._imageView = document.createElement('img');
    this._leftArrow = document.createElement('button');
    this._rightArrow = document.createElement('button');

    this._imageView.className = 'screenshots-image';
    this._leftArrow.className = 'screenshots-arrow screenshots-arrow-left';
    this._rightArrow.className = 'screenshots-arrow screenshots-arrow-right';

    this._imageURLs = [];
    for (var i = 0; i < this._count; ++i) {
      this._imageURLs.push('images/screenshots/' + this._name + '/' + (i+1) + '.png');
    }
    this._currentIndex = 0;
    this._imageView.src = this._imageURLs[0];

    this._element.appendChild(this._imageView);
    this._element.appendChild(this._leftArrow);
    this._element.appendChild(this._rightArrow);

    this.layout();
    window.addEventListener('resize', this.layout.bind(this));

    this._loading = false;
    this.registerArrowEvents();
  }

  Screenshots.FADE_OUT_DURATION = 200;
  Screenshots.FADE_IN_DURATION = 300;

  Screenshots.prototype.layout = function() {
    var arrowWidth = this._leftArrow.offsetWidth;
    var arrowHeight = this._leftArrow.offsetHeight;

    var width = this._element.offsetWidth;
    var contentWidth = Math.max(1, width-(2*arrowWidth));
    var contentHeight = (contentWidth / this._size.width) * this._size.height;
    var height = Math.max(arrowHeight, contentHeight);

    this._imageView.style.height = contentHeight;
    this._imageView.style.top = 'calc(50% - ' + Math.round(contentHeight / 2) + 'px)';
    this._imageView.style.left = 'calc(50% - ' + Math.round(contentWidth / 2) + 'px)';
    this._imageView.style.width = Math.round(contentWidth) + 'px';
    this._imageView.style.height = Math.round(contentHeight) + 'px';

    this._leftArrow.style.left = 'calc(50% - ' + Math.round(contentWidth/2 + arrowWidth) + 'px)';
    this._rightArrow.style.right = 'calc(50% - ' + Math.round(contentWidth/2 + arrowWidth) + 'px)';

    this._element.style.height = Math.ceil(height) + 'px';
  };

  Screenshots.prototype.readParameter = function(name) {
    return this._element.getElementsByClassName('screenshots-' + name)[0].value;
  };

  Screenshots.prototype.registerArrowEvents = function() {
    this._leftArrow.addEventListener('click', this.moveSlideshow.bind(this, -1));
    this._rightArrow.addEventListener('click', this.moveSlideshow.bind(this, 1));
  };

  Screenshots.prototype.moveSlideshow = function(addition) {
    if (this._loading) {
      return;
    }
    this._loading = true;
    this._currentIndex = (this._currentIndex + addition) % this._imageURLs.length;
    while (this._currentIndex < 0) {
      this._currentIndex += this._imageURLs.length;
    }
    fadeAnimation(this._imageView, 1, 0, Screenshots.FADE_OUT_DURATION, function() {
      var boundDoneHandler;
      boundDoneHandler = function() {
        this._imageView.removeEventListener('load', boundDoneHandler);
        this._imageView.removeEventListener('error', boundDoneHandler);
        fadeAnimation(this._imageView, 0, 1, Screenshots.FADE_IN_DURATION, function() {
          this._loading = false;
        }.bind(this));
      }.bind(this);
      this._imageView.addEventListener('load', boundDoneHandler);
      this._imageView.addEventListener('error', boundDoneHandler);
      this._imageView.src = this._imageURLs[this._currentIndex];
    }.bind(this));
  };

  window.addEventListener('load', function() {
    var elements = document.getElementsByClassName('screenshots');
    for (var i = 0, len = elements.length; i < len; ++i) {
      new Screenshots(elements[i]);
    }
  });

  function parseDimensions(x) {
    var res = /([0-9]*)x([0-9]*)/.exec(x);
    if (!res) {
      throw new Error('invalid dimensions: ' + x);
    }
    return {
      width: parseInt(res[1]),
      height: parseInt(res[2])
    };
  }

  function fadeAnimation(element, startOpacity, endOpacity, duration, cb) {
    var startTime = null;
    var frame;
    frame = function(t) {
      if (startTime === null) {
        startTime = t;
        window.requestAnimationFrame(frame);
        return;
      }
      var elapsed = t - startTime;
      var percentDone = Math.min(1, elapsed / duration);
      element.style.opacity = (startOpacity*(1-percentDone) + endOpacity*percentDone).toFixed(3);
      if (percentDone < 1) {
        window.requestAnimationFrame(frame);
      } else {
        cb();
      }
    };
    window.requestAnimationFrame(frame);
  }

})();
