UserModel = {
	properties: [
		'nickname', 'email', 'first_name', 'last_name', 'age', 'created_at', 'updated_at',
		 'identity', 'provider' // loginza
	],
	cast: {
		age: Number//,
		//'nested.path': String
	},
	indexes: ['nickname'],
	setters: {
		first_name: function(v){
			return this.v.capitalize();
		}
	},
	getters: {
		full_name: function(){ 
			return this.first_name + ' ' + this.last_name
		}
	},
	methods: {
		save: function(fn){
			var cur_date = new Date();
			if (this.isNew) {
				this.created_at = cur_date;
			}
			this.updated_at = cur_date;
			this.__super__(fn);
		}
	},
	static: {
		findNative: function(){
			return this.find({provider: ''});
		}
	}
}
