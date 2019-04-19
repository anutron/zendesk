window.Thanx = {

  adminUrl: 'https://admin.thanx.com/admin/',

  Imgs: new Class({

    initialize: function(workspace){
      this.workspace = document.id(workspace);
      if (!this.workspace.retrieve('Thanx.Imgs')){
        this.workspace.getElements('.attachment').each(this.enhance, this);
        this.addRotation();
        this.workspace.store('Thanx.Imgs', this);
      }
    },

    destroy: function(){
      this.workspace.eliminate('Thanx.Imgs');
    },

    enhance: function(attachment){
      this.precache(attachment);
    },

    precache: function(attachment){
      var img = attachment.getElement('img');
      if (img) img.set('src', attachment.href);
    },

    resetRotation: function(img){
      img.setStyles({
        transform: 'rotate(0deg)'
      });
    },

    allowScroll: function(gallery){
      // remove scroll event listeners
      $(document).off("mousewheel.modal-gallery, DOMMouseScroll.modal-gallery");
      gallery.getElement('.modal-image').setStyle("overflow", "auto");
    },

    addRotation: function(){
      var gallery = document.id('modal-gallery');

      if (!gallery.hasClass('hasRotation')){

        gallery.getElement('.modal-footer').adopt(
          new Element('a', {
            'class': 'btn',
            events: {
              click: function(){
                var img = gallery.getElement('.modal-image img.in');
                this.resetRotation(img);
                this.allowScroll(gallery);
                img.setStyle('transform', 'rotate(-90deg)');
              }.bind(this)
            }
          }).adopt(
            new Element('i', {
              'class': 'icon-arrow-left',
              styles: { paddingLeft: 4 }
            })
          ).adopt(
            new Element('span', { text: 'rotate left'})
          )
        ).adopt(
          new Element('a', {
            'class': 'btn',
            events: {
              click: function(){
                this.resetRotation(gallery.getElement('.modal-image img.in'));
              }.bind(this)
            }
          }).adopt(
            new Element('i', {
              'class': 'icon-refresh',
              styles: { marginRight: 4 }
            })
          ).adopt(
            new Element('span', { text: 'reset'})
          )
        ).adopt(
          new Element('a', {
            'class': 'btn',
            events: {
              click: function(){
                var img = gallery.getElement('.modal-image img.in');
                this.resetRotation(img);
                this.allowScroll(gallery);
                img.setStyle('transform', 'rotate(90deg)');
              }.bind(this)
            }
          }).adopt(
            new Element('span', { text: 'rotate right'})
          ).adopt(
            new Element('i', {
              'class': 'icon-arrow-right',
              styles: { marginLeft: 4 }
            })
          )
        ).adopt(this.getProgressForm());

        gallery.addClass('hasRotation');
      }
    },

    getProgressForm: function(){

      if (!this.progress){
        this.progress = new Thanx.ProgressForm({
          onSubmit: function(amount, date){
            this.closeModal();
            this.getWorkspace().addProgress(amount, date);
            this.progress.getForm().reset();
          }.bind(this)
        });
      }
      return this.progress.getForm();

    },

    getWorkspace: function(){
      return $$('.workspace.has-play[style!=display: none;]')[0].retrieve('Thanx.Workspace');
    },

    closeModal: function(){
      $$('#modal-gallery .close')[0].click();
    }

  }),

  Workspace: new Class({

    initialize: function(element){
      this.workspace = document.id(element);
      if (!this.recycle()) this.setup();
    },

    recycle: function(){
      var emailElement = this.getEmailElement();
      // if the email doesn't match what's already there, clean the element; it's been recycled
      if (emailElement && this.workspace.get('data-email') && this.workspace.get('data-email') != emailElement.href){
        this.detach();
        return true;
      } else {
        return false;
      }
    },

    getEmailElement: function(){
      return this.workspace.getElement('.email');
    },

    setup: function(){
      var emailElement = this.getEmailElement();
      if (emailElement){
        console.log('initializing new workspace', this.workspace);
        emailElement.set('data-email', emailElement.href);
        this.attach();
        new Thanx.Imgs(this.workspace);
      }
    },

    attach: function(){
      // has-play is added by zendesk to tabs when they are opened,
      // but isn't added to the workspace there on-load, so we add it
      // we rely on zendesk to remove the class, so we never remove it ourselves
      this.workspace.addClass('thanxChecked').addClass('has-play');
      this.getActions();
      if (this.actions){
        this.getTarget().adopt(this.actions);
        this.workspace.addClass('linkAdded');
        this.workspace.store('Thanx.Workspace', this);
      }
    },

    detach: function(){
      console.log('detaching workspace', this.workspace);
      if (this.actions) this.actions.destroy();

      if (this.adminModal) this.adminModal.destroy();
      if (this.adminIframe) this.adminIframe.destroy();
      if (this.adminBackdrop) this.adminBackdrop.destroy();
      this.adminLoaded = false;
      this.workspace.removeClass('linkAdded')
                    .removeClass('thanxChecked');
      this.getEmailElement().erase('data-email');
      this.workspace.eliminate('Thanx.Workspace');
    },

    getUserInfo: function(){
      var email,
          sender = this.workspace.getElement('.sender'),
          name = sender.get('text').split('<')[0],
          emailLink = sender.getElement('a.email');
      if (name && emailLink){
        email = emailLink.href.split(':')[1];
        return {
          email: email,
          name: name
        };
      } else {
        return {};
      }
    },

    getTicketId: function(){
      var ticketId = window.location.href.split('/');
      return ticketId[ticketId.length - 1];
    },

    getTarget: function(){
      if (!this.target) this.target = this.workspace.getElement('.header .source.delimited_items');

      return this.target;
    },

    getSubjectValue: function(){
      var subjectInput = this.workspace.getElement('[name=subject]');
      if (subjectInput && subjectInput.get('value')) {
        var match = subjectInput.get('value').match(/\(([^)]+)\)/);
        if (match) return match[1];
      }
    },

    getUserId: function(){
      return this.userId || this.getUserIdFromSubject() || this.getUserIdFromEmail();
    },

    getUserIdFromSubject: function(){
      if (this.userId) return this.userId;
      var subject = this.getSubjectValue();
      if (subject) this.userId = subject.split("/")[0].toInt();
      return this.userId;
    },

    getUserIdFromEmail: function(){
      if (this.userId) return this.userId;
      this.workspace.getElements('.current_collaborators ul li a').each(function(el){
        if (!this.userId){
          var to = el.get('html').split('@')[0];
          if (to){
            this.userId = to.split('+')[1];
          }
        }
      }, this);
      return this.userId;
    },


    addProgress: function(amount, date){
      this.openAdminIframe(Thanx.adminUrl +
                           '/users/' + this.getUserId() +
                           '?amount=' + amount +
                           '&ticket=' + this.getTicketId() +
                           '&date=' + date
                          , true);
    },

    closeProgress: function(){
      this.progressModal.removeClass('in').addClass('hide');
      this.progressBackdrop.removeClass('in').addClass('hide');
    },

    buildProgressModal: function(){
      if (!this.progressModal){
        this.progressBackdrop = new Element('div.modal-backdrop', {
          events: {
            click: this.closeProgress.bind(this)
          }
        });
        this.progress = new Thanx.ProgressForm({
          onClose: function(){
            this.closeProgress();
          }.bind(this),
          onSubmit: function(amount, date){
            this.addProgress(amount, date);
            this.closeProgress();
          }.bind(this)
        });
        this.progressModal = this.progress.getModal().inject(this.workspace);
      }
      return this.progressModal;
    },

    showProgressForm: function(){
      this.buildProgressModal();

      this.progress.getForm().reset();
      this.progress.getForm().getElement('input').focus();
      this.progressModal.addClass('in').removeClass('hide');
      this.progressBackdrop.inject(document.body).addClass('in').removeClass('hide');
    },

    getActions: function(){
      if (this.getUserId()) this.actions = this.idActions();
      else this.actions = this.searchActions();
      return this.actions;
    },

    idActions: function(){
      return new Element('div', {
        class: 'thanx',
        styles: {
          margin: '10px 0'
        }
      }).adopt(
        new Element('a', {
          href: Thanx.adminUrl + "users/" + this.getUserId(),
          target: 'admin',
          events: {
            click: this.adminClickHandler.bind(this),
          },
          'class': 'btn',
          styles: {
            marginRight: 4,
            backgroundColor: '#229d9d',
            color: '#fff',
            boxShadow: 'none'
          }
        }).set('text', "Thanx user #" + this.getUserId())
      ).adopt(
        new Element('a', {
          href: Thanx.adminUrl + "users/" + this.getUserId(),
          target: 'admin',
          'class': 'addTxn btn',
          data: {
            userId: this.getUserId()
          },
          styles: {
            marginRight: 4,
            backgroundColor: '#f4825c',
            color: '#fff',
            boxShadow: 'none'
          },
          events: {
            click: function(event){
              event.preventDefault();
              this.showProgressForm();
            }.bind(this)
          }
        }).set('text', "Add Progress")
      );
    },

    searchActions: function(){
      var user = this.getUserInfo();
      if (user.name && user.email){
        return new Element('div', {
          class: 'thanx',
          styles: {
            margin: '10px 0'
          }
        }).adopt(
          new Element('span', {styles: { display: 'inline-block'}}).adopt(
            new Element('span', {html: 'Search by: '})
          ).adopt(
            new Element('a', {
              href: Thanx.adminUrl + "/users?utf8=%E2%9C%93&q%5Bfirst_name_or_last_name_or_email_contains%5D=" + user.email + "&commit=Filter&order=id_desc",
              target: 'admin',
              events: {
                click: this.adminClickHandler.bind(this),
              },
              'class': 'btn',
              styles: {
                marginRight: 4,
                backgroundColor: '#d1ecf0',
                boxShadow: 'none'
              }
            }).set('text', "email")
          ).adopt(
            new Element('a', {
              href: Thanx.adminUrl + "/users?utf8=%E2%9C%93&q%5Bfirst_name_or_last_name_or_email_contains%5D=" + user.name + "&commit=Filter&order=id_desc",,
              target: 'admin',
              events: {
                click: this.adminClickHandler.bind(this),
              },
              'class': 'btn',
              styles: {
                marginRight: 4,
                backgroundColor: '#a5dcdf',
                boxShadow: 'none'
              }
            }).set('text', "name")
          )
        );
      }
    },

    adminClickHandler: function(event){
      event.preventDefault();
      this.openAdminIframe(event.target.href);
    },

    openAdminIframe: function(url, force){
      this.openWin(url);
      return

      if (!this.adminBackdrop && !this.adminModal) this.buildIframe();

      this.adminBackdrop.addClass('in').removeClass('hide');
      this.adminModal.addClass('in').removeClass('hide');
      if (!this.adminLoaded || force) {
        this.adminIframe.src = url;
        this.adminLoaded = true;
      }
    },

    buildIframe: function(){
      this.adminIframe = new Element('iframe', {
        styles: {
          width: '100%',
          height: window.getHeight() * 0.85
        }
      });
      this.adminBackdrop = new Element('div.modal-backdrop.in', {
        events: {
          click: this.closeAdmin.bind(this)
        }
      }).inject(document.body);
      this.adminModal = new Element('div.modal.fade.in', {
        styles: {
          width: '90%',
          left: '20%',
          height: window.getHeight() * 0.95,
          top: '34%'
        }
      }).adopt(
        new Element('div.modal-header').adopt(
          new Element('button.close', {
            type: 'button',
            text: 'x',
            events: {
              click: this.closeAdmin.bind(this)
            }
          })
        ).adopt(
          new Element('h3', {text: 'Admin'})
        )
      ).adopt(
        new Element('div.modal-body', {
          styles: {
            maxHeight: window.getHeight() * 0.85
          }
        }).adopt(this.adminIframe)
      ).inject(this.workspace);
    },

    closeAdmin: function(){
      this.adminModal.removeClass('in').addClass('hide');
      this.adminBackdrop.removeClass('in').addClass('hide');
    },

    openAdmin: function(event){
      event.preventDefault();
      this.openWin(event.target.href);
    },

    openWin: function(url, link){
      var thanxScreenX     = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
          thanxScreenY     = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
          thanxOuterWidth  = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
          thanxOuterHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.body.clientHeight - 22),
          thanxWidth    = 1400,
          thanxHeight   = 870,
          thanxLeft     = parseInt(screenX + ((thanxOuterWidth - thanxWidth) / 2), 10),
          thanxTop      = parseInt(screenY + ((thanxOuterHeight - thanxHeight) / 2.5), 10);
      // window.open(url, 'admin', 'scrollbars=1, width=' + thanxWidth + ', height=' + thanxHeight + ', left='+ thanxLeft + ', top=' + thanxTop);
      window.open(url, 'admin');
    }

  }),

  ProgressForm: new Class({

    Implements: [Options, Events],

    options: {
      // onClose: function(){}
      // onSubmit: function(amount, date){}
    },

    initialize: function(options){
      this.setOptions(options);
    },

    getForm: function(){
      if (this.form) return this.form;
      this.amount = new Element('input.span2', {
        type: 'text',
        placeholder: '0.00'
      });
      var today = new Date();
      this.date = new Element('input.span2', {
        type: 'text',
        placeholder: "e.g." + today.getDate() + "/" + today.getMonth() + "/" + today.getFullYear(),
        styles: { marginRight: 4 }
      });

      this.form = new Element('form.form-inline', {
        styles: { display: 'inline-block', marginLeft: 8 },
        events: {
          submit: function(event){
            event.preventDefault();
            this.fireEvent('submit', [this.amount.get('value'), this.date.get('value')]);
          }.bind(this)
        }
      }).adopt(
        new Element('div.input-prepend', { styles: { marginRight: 4 } }).adopt(
          new Element('span.add-on', {text: "$", styles: {padding: 5}})
        ).adopt(this.amount)
      ).adopt(this.date).adopt(
        new Element('button.btn', {
          type: 'submit',
          text: 'Add Progress',
          styles: {backgroundColor: "#f4825c", color: "#fff" }
        })
      );
      return this.form;
    },

    getModal: function(){
      if (this.modal) return this.modal;
      this.modal = new Element('div.modal.fade').adopt(
        new Element('div.modal-header').adopt(
          new Element('button.close', {
            type: 'button',
            text: 'x',
            events: {
              click: this.fireEvent.bind(this, 'close')
            }
          })
        ).adopt(
          new Element('h3', {text: 'Add Progress'})
        )
      ).adopt(
        new Element('div.modal-body').adopt(this.getForm())
      );
      return this.modal;
    }

  }),

  loadWorkspaces: function(){
    if (window.paused) return;
    $$('.workspace').each(function(workspace){

      /*

      conditions:
      * there is an instance already attached to the workspace
      * the workspace is no longer in play (.has-play, meaning the tab has been closed)
      >> detach the instance

      * the workspace has no instance
      * its display is block
      * OR
      * there is an instance
      * and the instance no longer matches the data in the element (instance.recycle())
      >> create new instance

      */

      var instance = workspace.retrieve('Thanx.Workspace');
      if (instance && !workspace.hasClass('has-play')) {
        instance.detach();
      } else if ((!workspace.hasClass('linkAdded') && workspace.getStyle('display') == 'block') || (instance && instance.recycle())){
        new Thanx.Workspace(workspace);
      }
    });
  }

};

console.log('Thanx loaded');
setInterval(function(){
  Thanx.loadWorkspaces();
}, 1000);
