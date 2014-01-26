var $ = jQuery;
/**
 *
 * Bootstrap remote data tabs plugin
 *
 * Author: Stephen Hoogendijk (TheCodeAssassin)
 *
 * Licensed under the GPLV2 license.
 *
 * @returns {{hasLoadingMask: boolean, load: Function, _executeRemoteCall: Function}}
 * @constructor
 */
var RemoteTabs = function() {
  var obj = {
      hasLoadingMask: false,

      /**
       *
       * @param tabEvent
       * @param hasLoadingMask
       */
      load: function(tabEvent, hasLoadingMask) {

          var me = this;

          me.hasLoadingMask = !!hasLoadingMask;

          // enable all remote data tabs
          $('[data-toggle=tab]').each(function(k, tab) {
              var tabObj = $(tab),
                  tabDiv,
                  tabData,
                  tabCallback,
                  url,
                  simulateDelay;

              // check if the tab has a data-url property
              if(tabObj.is('[data-tab-url]')) {
                  url = tabObj.attr('data-tab-url');
                  tabDiv = $(tabObj.attr('href'));
                  tabData = tabObj.attr('data-tab-json') || [];
                  tabCallback = tabObj.attr('data-tab-callback') || null;
                  simulateDelay = tabObj.attr('data-tab-delay') || null;

                  if(tabData.length > 0) {
                      try
                      {
                        tabData = $.parseJSON(tabData);
                      } catch (exc) {
                          console.log('Invalid json passed to data-tab-json');
                          console.log(exc);
                      }

                  }

                  tabObj.on(tabEvent, function(e) {

                      if (!tabObj.hasClass("loaded") || tabObj.is('[data-tab-always-refresh]')) {

                          if(me.hasLoadingMask) {
                              tabDiv.mask('Loading...');
                          }

                          // delay the json call if it has been given a value
                          if(simulateDelay) {
                              clearTimeout(window.timer);
                              window.timer=setTimeout(function(){
                                me._executeRemoteCall(url, tabData, tabCallback, tabObj, tabDiv);
                              }, simulateDelay);
                          } else {
                              me._executeRemoteCall(url, tabData, tabCallback, tabObj, tabDiv);
                          }


                      }

                  });

              }
          });
    },

      /**
       * Execute the remote call
       * @param url
       * @param customData
       * @param callbackFn
       * @param trigger
       * @param tabContainer
       * @private
       */
    _executeRemoteCall: function(url, customData, callbackFn, trigger, tabContainer) {
        var me = this;


        $.ajax({
            url: url,
            data: customData || [],
            success: function(data) {
                if(me.hasLoadingMask) {
                    tabContainer.unmask();
                }
                if (data) {
                    tabContainer.html(data);

                    if(typeof window[callbackFn] == 'function') {
                        window[callbackFn].call(null, data, trigger, tabContainer, customData);
                    }
                    if(!trigger.hasClass("loaded")) {
                        trigger.addClass("loaded");
                    }
                }
            },
            fail: function(data) {
                if(me.hasLoadingMask) {
                    tabContainer.unmask();
                }
            }
        });
    }
  };
    var hasLoadingMask = (jQuery().mask ? true : false);

    // hook the event based on the version of bootstrap
    obj.load('shown.bs.tab', hasLoadingMask);

    return obj;
};

var remoteTabsPluginLoaded = new RemoteTabs();
