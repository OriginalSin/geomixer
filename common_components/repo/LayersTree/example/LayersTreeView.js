var LayersTreeNodeView = Thorax.View.extend({
    initialize: function() {
        var parent = this.model.get('parent');
        parent && parent.on('change:list', function() {
            this.render();
        }, this);
    },
    itemView: LayersTreeNodeView,
    model: nsGmx.LayersTreeNode,
    events: {
        'click .visible-input': function() {
            var isVisible = this.$el.find('.visible-input')[0].checked;
            this.model.setNodeVisibility(isVisible);
        },
        'click .editType': function() {
            this.model.set('list', !this.model.get('list'));
        },
        'click .expand': function() {
            this.model.set('expanded', !this.model.get('expanded'));
        }
    },
    context: function() {
    
        //lazy generation
        if (this.model.get('expanded') && !this.childrenView) {
            this.childrenView = new LayersTreeCollectionView({collection: this.model.get('childrenNodes')});
            this.childrenView.retain(); //thorax releases this view when folder view is 
        }
        
        var parentModel = this.model.get('parent');
        return $.extend({}, this.model.attributes, {
            isRadio: parentModel ? parentModel.get('list') : false
        });
    },
    template: Handlebars.compile(
        '<div class="treeNode">' +
            '{{#if childrenNodes}}<span class="expand">{{#if expanded}}-{{else}}+{{/if}}</span>{{/if}}' +
            '<label>' + 
                '<input type="{{#if isRadio}}radio{{else}}checkbox{{/if}}" class="visible-input" {{#visible}}checked{{/visible}}>' + 
                '<span class="title">{{properties.title}}</span>' + 
                '{{#if childrenNodes}}' + 
                    '<button class="editType">change type</button>' +
                    '({{childrenNodes.length}})' +
                '{{/if}}' +
            '</label>' + 
            '{{#if expanded}}{{#if childrenNodes}}<div class="children">{{view childrenView}}</div>{{/if}}{{/if}}' +
        '</div>'
    )
});

var LayersTreeCollectionView = Thorax.CollectionView.extend({
    itemView: LayersTreeNodeView
});