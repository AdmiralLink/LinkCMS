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