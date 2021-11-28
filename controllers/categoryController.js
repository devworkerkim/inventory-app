var Category = require('../models/category');
const { body, validationResult } = require('express-validator');

// Display list of all categories.
exports.category_list = function(req, res) {
    
    Category.find()
        .sort({ name: 'asc' })
        .exec(function (err, results) {
            if (err) console.error(err);
            res.render('category_list', { title: 'Categories', categories: results });
        });
};

// Display detail page for a specific category.
exports.category_detail = function(req, res) {

    Category.findById(req.params.id)
        .exec(function (err, category) {
            if (err) console.error(err);
            res.render('category_detail', { title: category.name, category: category });
        });
};

// Display category create form on GET.
exports.category_create_get = function(req, res) {
    res.render('category_form', { title: 'Create Category', category: undefined, errors: undefined });
};

// Handle category create on POST.
exports.category_create_post = [

    // Validate and santize the name field.
    body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
    body('description', 'Invalid description').optional().trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a category object with escaped and trimmed data.
        var category = new Category(
        { name: req.body.name, description: req.body.description }
        );

        if (!errors.isEmpty()) {
            console.log(errors);
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('category_form', { title: 'Create Category', category: category, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid.
            // Check if Category with same name already exists.
            Category.findOne({ 'name': req.body.name })
                .exec( function(err, found_category) {
                if (err) { return next(err); }

                if (found_category) {
                    // Category exists, redirect to its detail page.
                    res.redirect(found_category.url);
                }
                else {
                    category.save(function (err) {
                        if (err) { return next(err); }
                        // Category saved. Redirect to category detail page.
                        res.redirect(category.url);
                    });
                }
            });
        }
    }
];

// Display category delete form on GET.
exports.category_delete_get = function(req, res) {

    Category.findById(req.params.id)
        .exec(function (err, category) {
            if (err) console.error(err);
            res.render('category_delete', { title: 'Delete ' + category.name, category: category });
        });
};

// Handle category delete on POST.
exports.category_delete_post = function(req, res) {
    
    Category.findByIdAndDelete(req.params.id, function deleteCategory(err) {
        if (err) console.log(err);
        res.redirect('/inventory/category');
    })
};

// Display category update form on GET.
exports.category_update_get = function(req, res) {
    
    Category.findById(req.params.id)
        .exec(function (err, category) {
            if (err) console.log(err);
            res.render('category_form', { title: 'Update ' + category.name, category: category, errors: undefined });
        });
};

// Handle category update on POST.
exports.category_update_post = [

    // Validate and santize the name and description fields.
    body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
    body('description', 'Invalid description').optional().trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a category object with escaped and trimmed data.
        var category = new Category(
        { name: req.body.name, description: req.body.description, _id: req.params.id }
        );

        if (!errors.isEmpty()) {
            console.log(errors);
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('category_form', { title: 'Update' + category.name, category: category, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid.
            Category.findByIdAndUpdate(req.params.id, category, {}, function (err, theCategory) {
                if (err) console.log(err);
                // Successful - redirect to category detail page.
                res.redirect(theCategory.url);
            });
        }
    }
];