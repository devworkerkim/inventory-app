var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
  {
    name: {type: String, required: true, maxLength: 100},
    description: {type: String, required: false, maxLength: 500},
    category: {type: String},
    price: {type: Number, required: true, min: 0, default: 0},
    stock: {type: Number, required: true, min: 0, default: 0},
  }
);

// Virtual for item's URL
ItemSchema
.virtual('url')
.get(function () {
  return '/inventory/item/' + this._id;
});

//Export model
module.exports = mongoose.model('Item', ItemSchema);
