module.exports =  Marionette.ItemView.extend( {
	template: '#tmpl-drupal_layoutbuilder-panel-revisions-revision-item',

	className: 'drupal_layoutbuilder-revision-item',

	ui: {
		detailsArea: '.drupal_layoutbuilder-revision-item__details',
		deleteButton: '.drupal_layoutbuilder-revision-item__tools-delete'
	},

	triggers: {
		'click @ui.detailsArea': 'detailsArea:click',
		'click @ui.deleteButton': 'delete:click'
	}
} );
