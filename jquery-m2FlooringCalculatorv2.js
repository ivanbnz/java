;
(function($, window, document, undefined) {
    var M2Calculator = function(ele, opt) {
        this.$element = ele;
        this.iframe = null;
        this.domain = "https://calculator.measuresquare.com/";
        this.defaults = {
            measureSystem: "Metric",
            showCutSheet: true,
            showDiagram: true,
            cancel: function() {},
            callback: function(data) {}
                //product: {
                //    type: "carpet",
                //    name: "carpet",
                //    width: "12'00\"",
                //    length: "150'00\"",
                //    horiRepeat: "",
                //    vertRepeat: "",
                //    horiDrop: "",
                //    vertDrop: ""
                //},

        };
        this.options = $.extend({}, this.defaults, opt);
    }

    M2Calculator.prototype = {
        init: function() {
            var $this = this;

            window.addEventListener('message', function(e) {
                var origin = e.origin || e.originalEvent.origin;
                if (origin != $this.domain.substring(0, $this.domain.length - 1))
                    return;

                var data = e.data;
                if (data == "closeCalculator") {
                    $("#m2calculator-closeBtn").trigger("click");
                    return;
                }
                if (data == "m2cancel") {
                    $this.options.cancel();
                }
                if (data != "m2cancel" && typeof data.usage != "undefined") {
                    $this.options.callback(data);
                }
                if ($this.iframe != null)
                    document.body.removeChild($this.iframe);

                $(document.body).css({ overflow: "", "padding-right": "0" });
            }, false);

            return this.$element.on("click", function() {
                var modal = $('<div id="m2calculator-wrapper"></div>'),
                    mask = $('<div></div>'),
                    container = $('<div></div>'),
                    header = $('<div></div>');
                closeBtn = $('<button id="m2calculator-closeBtn">close</button>'),
                    iframe = $('<iframe frameborder="no" id="m2Calculator-iframe"></iframe>');
                mask.css({ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, "background-color": "#333", filter: "alpha(opacity = 50)", opacity: 0.5, zIndex: 9998 });
                modal.append(mask);

                var clientHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
                var height = clientHeight > 610 ? clientHeight - 60 : 550,
                    margin = $(window).width() >= 1092 ? "0 auto" : "0 1%";

                container.css({
                    "cssText": "width: 98%; min-width: 360px; max-width: 1060px; height:" + height + "px; position: fixed; top: 30px; left: 0; right: 0; margin:" + margin + ";box-shadow: 0 5px 15px rgba(0,0,0,.5); border-radius: 4px; background: #fff; z-index: 9999;"
                });

                header.css({ position: "absolute", top: -8, right: -8 });
                closeBtn.css({
                    "cssText": "background-image: none !important; background-color: #428bca !important; border: 1px solid #357ebd !important; cursor: pointer; padding: 6px 8px !important;border-radius: 4px !important; color: #fff !important"
                });
                closeBtn.on("mouseover", function() {
                    $(this).css({ "background-color": "#3071a9", "border-color": "#285e8e;" });
                }).on("mouseout", function() {
                    $(this).css({ "background-color": "#428bca", "border-color": "#357ebd;" });
                });

                closeBtn.on("click", function() {
                    $this.iframe = this.parentNode.parentNode.parentNode;
                    $(this).parent().next("iframe")[0].contentWindow.postMessage('getEstimate', "*");
                });
                header.append(closeBtn);

                container.append(header);

                var urls = [$this.domain];
                urls.push("flooring/");
                urls.push("?measureSystem=" + $this.options.measureSystem);
                urls.push("&showCutSheet=" + $this.options.showCutSheet);
                urls.push("&showDiagram=" + $this.options.showDiagram);
                if ($this.options.product) {
                    for (var i in $this.options.product) {
                        if ($this.options.product[i] && $this.options.product[i] != "") {
                            urls.push("&" + i + "=" + $this.options.product[i]);
                        }

                    }
                }

                iframe.attr({ src: urls.join(""), width: "100%", height: "100%" })
                container.append(iframe);
                modal.append(container);

                $(window).on("resize", function() {
                    if ($(window).width() >= 1092) {
                        container.css({ margin: "0 auto" });
                    } else {
                        container.css({ margin: "0 1%" });
                    }
                });

                if ($this.isMobile()) {
                    container.css("-webkit-overflow-scrolling", "touch").css("overflow-y", "scroll");
                } else {
                    $(document.body).css({ overflow: "hidden", "padding-right": "17px" });
                }

                $(document.body).append(modal);
                return false;
            });
        },

        isMobile: function() {
            var ua = navigator.userAgent.toLowerCase();
            var StringPhoneReg = "\\b(ip(hone|od)|android|opera m(ob|in)i" +
                "|windows (phone|ce)|blackberry" +
                "|s(ymbian|eries60|amsung)|p(laybook|alm|rofile/midp" +
                "|laystation portable)|nokia|fennec|htc[-_]" +
                "|mobile|up.browser|[1-4][0-9]{2}x[1-4][0-9]{2})\\b";
            var StringTableReg = "\\b(ipad|tablet|(Nexus 7)|up.browser" +
                "|[1-4][0-9]{2}x[1-4][0-9]{2})\\b";

            var isIphone = ua.match(StringPhoneReg),
                isTable = ua.match(StringTableReg),
                isMobile = isIphone || isTable;

            return isMobile;
        }
    }

    $.fn.m2Calculator = function(options) {
        var calculator = new M2Calculator(this, options);
        return calculator.init();
    }
})(jQuery, window, document);