<?php

namespace LinkCMS\Actor;

use \Flight;

class Display {
    /**
     * Display controls the Twig templating for Core
     */
    var $filters = [];
    var $functions = [];
    var $reserved = ['filters', 'functions', 'manageMenu', 'messages', 'pageSlug', 'parentSlugs', 'reserved', 'variables', 'user', 'userLevels'];
    var $templateDirectories = [];
    var $variables = [];

    public function __call($method, $args) {
        /**
         * The magic sauce that makes passing global functions to Twig possible
         * 
         * System-only
         */
        if (in_array($method, $this->functions) && isset($this->$method)) {
            $function = $this->method;
            return call_user_func_array($function, $args);
        }
    }

    public static function add_filters_and_globals() {
        /**
         * Adds filters and global variables to the Twig templates. 
         * 
         * System-only
         */
        $display = Display::load();
        $core = Core::load();

        self::register_filter('url', function($url) {
            $siteUrl = Config::get_config('siteUrl');
            return $siteUrl . '/' . $url;
        });

        if (count($display->filters) > 0) {
            foreach ($display->filters as $name=>$function) {
                $filter = new \Twig\TwigFilter($name, $function, ['needs_context'=>true]);
                $GLOBALS['linkcmsTwigLoader']->addFilter($filter);
            }
        }
        
        $messages = Core::get_messages();

        if ($messages && count($messages) > 0) {
            $GLOBALS['linkcmsTwigLoader']->addGlobal('messages', $messages);
        }

        if (!empty($display->variables)) {
            foreach ($display->variables as $param) {
                $GLOBALS['linkcmsTwigLoader']->addGlobal($param, $display->{$param});
            }
        }

        if (!empty($display->functions)) {
            foreach ($display->functions as $param) {
                $function = new \Twig\TwigFunction($param, $display->{$param}, ['needs_context'=>true]);
                $GLOBALS['linkcmsTwigLoader']->addFunction($function);
            }
        }

        foreach (['siteTitle', 'siteUrl', 'siteDebug'] as $configVar) {
            $GLOBALS['linkcmsTwigLoader']->addGlobal($configVar, Config::get_config($configVar));
        }

        $GLOBALS['linkcmsTwigLoader']->addGlobal('user', User::get_current_user());

        $GLOBALS['linkcmsTwigLoader']->addGlobal('manageMenu', $core->menu->get_items());
    }

    public static function load() {
        /**
         * Loads the global display variable
         */
        return $GLOBALS['linkcmsdisplaycore'];
    }

    public static function register_global(string $name, $value, bool $isFunction=false) {
        /**
         * For registering Twig global variables or functions
         * 
         * @param string $name The name of the method or property you're trying to create
         * @param $value The value (or method to call) to assign. If a method, use ['namespace', 'function'] for static methods, or pass an object of the class if you want to use specific data
         * @param bool $isFunction True if you want to pass a method
         */
        $display = Display::load();
        if ($name == 'filters') {
            throw new \Exception('Illegal name in Display global');
        }
        if (isset($display->{$name})) {
            throw new \Exception('Display global ' . $name . ' already set');
        }
        array_push($display->reserved, $name);
        if ($isFunction) {
            array_push($display->functions, $name);
            $display->{$name} = $value;
        } else {
            array_push($display->variables, $name);
            $display->{$name} = $value;
        }
    }

    public static function add_path_info() {
        /**
         * Adds path info to the Twig variables (pageSlug and parentSlugs)
         */
        $request = Flight::request();
        $parts = explode('/', $request->url);
        if (count($parts) > 1) {
            $GLOBALS['linkcmsTwigLoader']->addGlobal('pageSlug', $parts[count($parts)-1]);
            if (($key = array_search('manage', $parts)) !== false) {
                unset($parts[$key]);
            }
            $GLOBALS['linkcmsTwigLoader']->addGlobal('parentSlugs', $parts);
        } else if (count($parts) == 1) {
            $GLOBALS['linkcmsTwigLoader']->addGlobal('pageSlug', $parts[0]);
        }
    }

    public static function add_template_directory($directory) {
        /**
         * Adds a template directory to the TwigLoader. DO NOT start at a "templates" folder level, as it will pollute the directory. 
         * Instead, create a containing folder that includes the module/theme name to avoid collisions
         */
        $display = Display::load();
        array_push($display->templateDirectories, $directory);
        return true;
    }

    public static function find_header($filename) {
        /**
         * Searches the internal file header type so we can return the appropriate header for different file extensions 
         */
        $type = false;
        $extension = explode(".", $filename);
        $extension = end($extension);
        if ($extension && in_array($extension, array_keys(File::KNOWN_EXTENSIONS))) {
            $type = File::KNOWN_EXTENSIONS[$extension];
            self::header($type);
        }
    }

    public static function header(String $type) {
        /**
         * Output file header (used by find_header, can be manually used as well)
         */
        header('Content-type: ' . $type);
    }

    public static function register_filter($name, $function) {
        /**
         * For registering Twig filters
         * 
         * @param string $name The name of the filter you want to register
         * 
         * @param $function The function you want to call when the filter is called. Use ['namespace', 'function'] for static methods, or pass an object of the class if you want to use specific data
         */
        $display = Display::load();
        if ( !in_array($name, array_keys($display->filters)) ) {
            $display->filters[$name] = $function;
        }
    }

    public static function load_page($template, array $data=[], $print=true) {
        /**
         * Load a core Twig template
         * 
         * @param string $template The Twig template filename from the base path /templates
         * @param array $data The data to pass to the Twig template
         */
        $display = Display::load();

        $GLOBALS['linkcmsTwigFileLoader'] = new \Twig\Loader\FilesystemLoader(__DIR__ . '/../Templates');
        if (!empty($display->templateDirectories)) {
            foreach ($display->templateDirectories as $dir) {
                $GLOBALS['linkcmsTwigFileLoader']->addPath($dir);          
            }
        }
        $GLOBALS['linkcmsTwigLoader'] = new \Twig\Environment($GLOBALS['linkcmsTwigFileLoader'], []);
        Display::add_filters_and_globals();
        self::add_path_info();
        if ($print) {
            echo $GLOBALS['linkcmsTwigLoader']->render($template, $data);
        } else {
            return $GLOBALS['linkcmsTwigLoader']->render($template, $data);
        }
        exit();
    }

    public static function load_error_page($error) {
        /**
         * For displaying an error page to the user.
         */
        $display = Display::load();
        $GLOBALS['linkcmsTwigLoader'] = new \Twig\Loader\FilesystemLoader(__DIR__ . '/../Templates');
        if (!empty($display->templateDirectories)) {
            foreach ($display->templateDirectories as $dir) {
                $GLOBALS['linkcmsTwigLoader']->addPath($dir);          
            }
        }
        $GLOBALS['linkcmsTwigLoader'] = new \Twig\Environment($GLOBALS['linkcmsTwigLoader'], []);
        echo $GLOBALS['linkcmsTwigLoader']->render('error.twig', $error);
        exit();
    }
}

$GLOBALS['linkcmsdisplaycore'] = new Display();