# 0.9.8
## ADDED
- Readme

# 0.9.7
## REMOVED
- Some debugging var_dumps

# 0.9.6
## ADDED
- Comments throughout
## MODIFIED
- User-settable 404 + Error handlers now only expect the template rather than the whole executable function

# 0.9.5
## ADDED
- Content.js
## MODIFIED
- Content Controller includes exerpt, default load_ functions
- Content model no longer abstract (can be used as Factory)
- Added paragraph tag shortcut to Hat
- Textareas styled better in forms

# 0.9.4
## ADDED
- Content type registry
- $theme, $content to config
- New header types to Display
- Default home page handlers
- Initialize theme
- Template to content model
- Messages added to index
- File, Settings actors
- Settings template file
## MODIFIED
- Fixed ImageBlock when removing image + saving
- Renamed Themes to Theme
- Null checks for image content


# 0.9.3
## ADDED
- Editor.getBlock
## MODIFIED
- DomButton now allows for multiple classes
- BlockPosition now automatically set after every block change
- Blocks no longer indexed by ID - they are now just a simple array
- Editor.RemoveBlock now checks for element in Blocks against elements
- Block ID is set on addBlock
- ImageBlock now uses ImageLibrary
- Buttons no longer underlined text
- Stacked buttons nudged svgs

# 0.9.2
## ADDED
- "Load More" button for Image Library
## MODIFIED
- Swapped Open Sans Condensed for Open Sans
- Uses Open Sans throughout
- Disabled state for buttons now universal

# 0.9.1
## MODIFIED
- Updated Error so it only needs a string
- Updated Hat to 0.6.5

# 0.9.0
## ADDED
- Controller/Database::get_count for full count of items
- Controller/Image::load_all to load image objects instead of raw data
- ImageLibrary CSS
- /// JS ///
- ImageLibrary, Image class to image.js
- ImageLibraryModal to Notify.js
## MODIIFIED
- Image actor has load routes; upload route now returns full upload info; image directory now set properly
- Controller/Database::load_all has proper SQL syntax for ORDER BY, proper order of offset/limit/order
- /// JS ///
- Checkboxes now includes proper IDs for label functionality
- Moved ImageUploadModal to Notify
- Modified ParagraphToolbar's addImage method to use ImageLibrary
- ImageUploadModal now returns raw ajax data rather than the imageel

# 0.8.2
## ADDED
- Added image model, controller and actor
## MODIFIED
- Redirect cookie now setting for whole domain instead of specific URL
- Ajax.js now allows you to pass FormData object without modification if you so desire
- ImageUploader now has fields for caption, credit; new way of checking requireds

# 0.8.1
## ADDED
- Database methods for get_field and load_all
- Slugify in Utilities.js
- window.linkcms in manage header
- Content Actor (API route for checking slugs)
- Content controller
## MODIFIED
- Fixed redirect issue in User::is_authorized
- Authorization now required for managing modules (d'oh)
- Content model to match new Page module model
- Updates and saves now return true/false (or insert ID, for save)
### Hat/JS components
- Hat 0.5.0 release
- Ajax JS to handle sending objects 
- Editor's RemoveBlocks refactored to allow for RemoveAllBlocks
- Toolbar's unlink button disabled after use; CheckForTag now checks more to make sure we're in the RIGHT edit container; FormattingCheck set after editEl focused into by click
- Hat's createEditor now returns the editor you create
- Hat.start() returns new editor when data is passed to it
- MiniModal now allows for more things to be added after construct; adds NotificationTarget and NotificationText for non-text content to be accessibly explained via screen reader; adds proper aria roles for basic modals (and the controls to customize them as needed)
## REMOVED
- API Actor (remember the mantra: Only include what you need)=
- Flatpickr

# 0.8.0
## ADDED
- Started Hat integration, added Hat.js and CSS
- Parsed out ajax, dom and image from Hat
- DatePicker, DatePickerModal
- WorkingModal (for loading)
- Inverse buttons, datepicker CSS
- Notify.js to base
## MODIFIED
- Swapped out Notify/MicroModal with MiniModal from Hat
- Content now has different look for save/publish buttons 
- Fixed button macro in forms.twig
- Fixed Route::register_folder_map
## REMOVED
- Flatpickr css

# 0.7.3
## ADDED
- Email Actor, phpmailer dependency
- Base email and email macros templates
- PasswordReset, PasswordResetExpiry fields to User Model
- strip_for_save method to user to get rid of non-DB fields before save/update
- Pristine validator for same-password
## MODIFIED
- Display::load_page now takes $print parameter so you can return the page contents (e.g., emails)
- Database::update() more robust, checks for IDs, kicks out to save if not set
- Fixed user construct when passing object
- Fixed hidden field macro so it doesn't ask for a label (because it's hidden)

# 0.7.2
## ADDED
- Route::register
- Route::register_manage_folder and Route::register_public_folder to allow for self-contained modules
## MODIFIED
- Used native Flight::json rather than our customer header
- (Display) Twigloader now has properly case-sensitive template path

# 0.7.1
## MODIFIED
- Tweaked redirect route so it went /users/@username instead of /users/edit/@username
- Core::VERSION

# 0.7.0
## ADDED
- API class with route registration, though none of it really does anything yet
- Namespace registration in core (so we don't get conflicting URLs, at least at the top level)
- Error::UNAUTHORIZED, to be used in API authorization errors
- API errors now return as json regardless of settings
- Ajax validation micro-library
- Display::header()
- Controller\User::get_all($col)
- js\utilties.js
- errormsg, offWhite and ivory colors
- set_current_user, userLevels hooks
- Controller\Database::delete_by
- Controller\User::load-by and ::save
- Modal styling
## MODIFIED
- It's a major version bump because we jacked with the default user levels by a factor of 10
- Input types with validation now wrapped in formset.form-group
- Routes has its own global/storage now, rather than depending on Core
- Moved Whoops error handling out of Route, so now it just calls the Error class
- set_config only saves the config if it's new, which means we're not hammering with file writes on every page load
- Consolidated some JS bundles
- JSON-formatted errors are now more smarter, call when they should
- Forms.js updated to better handle JSON errors
- UserLevels moved to function in User Actor
- Fiex Controller\Database::update
- Changed fancyName to displayLabel in forms.twig
## REMOVED
- RequireJS and associated dependencies. We're now pure vanilla JS
- Month and week inputs, because seriously?

# 0.6.0
## ADDED
- Templates in /macros/forms/{macro}.twig for the forms macros so they can be called dynamically
- Description to modules template
- Twig filters and functions now use context (require second variable in declaration)
## MODIFIED
- Moved forms macro into "macros" folder
- Renamed forms macros to /macros/forms.twig
- Renamed Config::get_value method to Config::get_config
- Fixed Twig Function adding
- Separated Twig Environment and Loader variables
- Error handler fixed when core error is called (forces base error rather than relying on template)
- Renamed Form Actor to FormHandler
- Menu now properly registers items so they can get sub_items
- Fixed the menu template AGAIN
## REMOVED
- Core::get_value()
- $core->configLoaded (Now $core->config->configLoaded)

# 0.5.0
## ADDED
- User actor
- User controller's load_all method
- Basic responsive CSS table layout
## MODIFIED
- User functions moved out of Core to User actor (users hooks, but does not rely solely on them)
- Calls because of above (including Display's User global)
- Set exception handler so we don't have uncaught exceptions when whoops is not running

# 0.4.0
## ADDED
- Flatpickr (date picker) + pristine (validator) JS plugins
- Proper default action for is_authorized hook
- Module loading
- .form class if you want elements but not a real form
- Columnar CSS grid layouts (.col-X, .col-xs-X), .auto-grid
- Success, green SASS classes
## MODIFIED
- Created 'SASS/lib' folder, moved quill to it
- Menu coloration working properly, sorting working
- Add_redirect now gives option to set HTTP header, default temp redirect
- Redirect cookie now serialized array instead of string
- Fixed redirect loop when checking for redirects
- Fixed some of the form twig elements to include labels
## REMOVED
- jQuery, Parsley (requires jQuery)
- Direct call to Authenticate/Actor register in Core::load() (now loaded as module)

# 0.3.2
## MODIFIED
- More dangling CSS changes

# 0.3.1
## MODIFIED
- Modules twig looks for correct parameter (active instead of all)

# 0.3.0
## ADDED
- Modules actor, twig page
- More documentation to Core
- Core now has hooks for authorization (logged_in, check_user_level, get_user)
## MODIFIED
- Significantly reworked CSS to eliminate some extra styles, shave characters from others (saved ~9K)
- Fixed a problem with menu
- Menu.twig outputs
- Fixed a problem with manage's index.twig variable inheritance
## REMOVED
- User management to the authentication plugin

# 0.2.1
## ADDED
- Separate method for calling errors directly (when we can't be confident that config has loaded)
## MODIFIED
- Handles config errors better

# 0.2.0 
## MODIFIED
- Working index, errors
- Authentication successfully modularized in modules

# 0.1.3
## MODIFIED
- Changed folder names

# 0.1.2
## ADDED
- Some .gitignores to keep important folders extant
## MODIFIED
- Changed .gitignore
- Renamed Template actor to Theme

# 0.1.1
## MODIFIED
- Added DS_Store to gitignore

# 0.1.0
## ADDED
- Partials twig folder - menu, header, messages
- 404; large and small logo images
- Menu, MenuItem models
- Display class now allows for adding of arbitrary template directories
- Many modular CSS classes
- Error class allows for template to register error and 404 handlers
- Actors for installers and update exist, but they'll need to be updated when we get the other authentication modules working
## MODIFIED
- Error handling now uses Whoops if dev, otherwise CMS
- Isolated Authenticate into its own module
- Login/Logout works
- User model more abstracted to work with multiple authentication types
- Admin and Database controllers

# 0.0.2
## ADDED
- Logos
- Install page, route
- jQuery form validator JS
## MODIFIED
- Site.json.sample now an actual sample
- Site Config form now uses the right damn macros
- Fixed the non-debug error page (changed variable to error from errorMsg
# 0.0.1
## ADDED
- A whole bunch of half-done modules. Twig is working, have the basics of the user form done
- Display has filters and globals
- Core has hooks and filters, but haven't tested if they actually work yet