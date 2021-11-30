const path = require('path');
const fs = require('fs');
const Item = require('../models/item');
const Category = require('../models/category');
const async = require('async');
const { body, validationResult } = require('express-validator');
const multer = require('multer');

// Set Storage
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage,}).single('image');

exports.index = function(req, res) {

    async.parallel({
        categories: function(callback) {
            Category.find().countDocuments().exec(callback);
        },
        items: function(callback) {
            Item.find().countDocuments().exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err) }
        res.render('index', { title: 'Inventory Page', categoryCount: results.categories, itemCount: results.items});
    })
}

// Display list of all items.
exports.item_list = function(req, res) {
    
    Item.find().sort({ name: 'asc'})
        .exec(function (err, result) {
            if (err) console.log(err)
            res.render('item_list', { title: 'Item List', items: result });
        })
};

// Display detail page for a specific item.
exports.item_detail = function(req, res) {

    Item.findById(req.params.id)
        .exec(function (err, result) {
            if (err) console.log(err)
            res.render('item_detail', { title: result._id, item: result })
        })
};

// Display item create form on GET.
exports.item_create_get = function(req, res) {

    Category.find().sort({ name: 'asc' })
        .exec(function (err, result) {
            if (err) console.log(err)
            res.render('item_form', { title: 'Create Item', item: undefined, categories: result, update: false, errors: undefined});
        });
};

// Handle item create on POST.
exports.item_create_post = [
    
    // Validate and santize the name field.
    body('name', 'Item name required').trim().isLength({ min: 1 }).escape(),
    body('description', 'Invalid description').optional().trim().escape(),
    body('category', 'Item category required').escape(),
    body('price', 'Invalid price').isCurrency({ allow_negatives: false }),
    body('quantity', 'Invalid quantity').isInt({ min: 0 }),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a category object with escaped and trimmed data.
        var item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            quantity: req.body.quantity
        });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            Category.find().sort({ name: 'asc' })
            .exec(function (err, result) {
                if (err) console.log(err)
                res.render('item_form', { title: 'Create Item', item: item, categories: result, update: false, errors: errors.array()});
            }); 
            return;
        }
        else {
            // Data from form is valid.
            // Check if Item with same name already exists.
            Item.findOne({ 'name': req.body.name })
                .exec( function(err, found_item) {
                if (err) { return next(err); }

                if (found_item) {
                    // Item exists, redirect to its detail page.
                    res.redirect(found_item.url);
                }
                else {
                    item.save(function (err) {
                        if (err) { return next(err); }
                        // Category saved. Redirect to category detail page.
                        res.redirect(item.url);
                    });
                }
            });
        }
    }
];

// Display item delete form on GET.
exports.item_delete_get = function(req, res) {
    
    Item.findById(req.params.id)
        .exec(function (err, item) {
            if (err) console.error(err);
            res.render('item_delete', { title: 'Delete ' + item.name, item: item });
        });
};

// Handle item delete on POST.
exports.item_delete_post = function(req, res) {
    
    if (req.body.password !== process.env.PASSWORD) {
        res.redirect('/inventory/item/' + req.params.id + '/delete');
    }
    else {
        Item.findByIdAndDelete(req.params.id, function deleteItem(err, deletedItem) {
            if (err) console.log(err);
            for (let image of deletedItem.images) {
                fs.unlink(image.path, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
            }
            res.redirect('/inventory/item');
        })
    }
};

// Display item update form on GET.
exports.item_update_get = function(req, res) {

    async.parallel({
        categories: function(callback) {
            Category.find().exec(callback);
        },
        item: function(callback) {
            Item.findById(req.params.id).exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err) }
        res.render('item_form', { title: 'Inventory Page', categories: results.categories, item: results.item, update: true, errors: undefined});
    })
}

// Handle item update on POST.
exports.item_update_post = [
    
    // Validate and santize the name field.
    body('name', 'Item name required').trim().isLength({ min: 1 }).escape(),
    body('description', 'Invalid description').optional().trim().escape(),
    body('category', 'Item category required').escape(),
    body('price', 'Invalid price').isCurrency({ allow_negatives: false }),
    body('quantity', 'Invalid quantity').isInt({ min: 0 }),
    body('password', 'Invalid password').equals(process.env.PASSWORD),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a category object with escaped and trimmed data.
        var item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            quantity: req.body.quantity,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            Category.find().sort({ name: 'asc' })
            .exec(function (err, result) {
                if (err) console.log(err)
                res.render('item_form', { title: 'Update ' + item.name, item: item, categories: result, update: true, errors: errors.array()});
            }); 
            return;
        }
        else {
            // Data from form is valid.
            Item.findByIdAndUpdate(req.params.id, item, {}, function (err, theItem) {
                if (err) console.log(err);
                // Successful - redirect to item detail page.
                res.redirect(theItem.url);
            });
        }        
    }
];

exports.item_addimage_get = function (req, res) {
    res.render('addimage', {title: 'Add Image'});
}

exports.item_addimage_post = function (req, res) {
    upload(req, res, (err) => {
        if (err) res.render('addimage', {title: 'Add Image'});
        else if (req.file === undefined) {
            res.redirect('/inventory/item/' + req.params.id);
        }
        else {
            Item.findById(req.params.id)
                .exec(function (err, result) {
                    result.images.push(req.file);
                    result.save(function (err, doc) {
                        if (err) console.log(err);
                        res.redirect(result.url);
                    });
                });
        }
    })
}