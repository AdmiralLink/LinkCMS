<?php

namespace LinkCMS\Model;

class Menu {
    /**
     * Used for backend menu. Probably could also be used for frontend menus, but I only need one and it's in the theme so ¯\_(ツ)_/¯
     */
    var $itemSlugs = [];
    var $items = [];
    var $href;
    var $menu;

    public function __construct($name) {
        $this->name = $name;
    }

    public function add_item(String $slug, String $name, String $href, $attr=false, $parentSlug=false, $weight=50) {
        $item = new MenuItem($slug, $name, $href, $attr, $weight);
        if ($parentSlug) {
            if (in_array($parentSlug, $this->itemSlugs)) {
                $this->items[$parentSlug]->add_child_item($item);
            } else {
                throw new \Exception('Menu item with ID "' . $parentSlug . '" does not exist.');
            }
        } else {
            $this->items[$slug] = $item;
            array_push($this->itemSlugs, $item->slug);
        }
    }

    public function get_items() {
        $itemObject = new \ArrayObject($this->items);
        $itemObject->uasort(function($a, $b) {
            if ($a->positionWeight == $b->positionWeight) {
                return ($a->slug < $b->slug) ? -1 : 1;
            } else {
                return ($a->positionWeight > $b->positionWeight) ? -1 : 1;
            }
        });
        return $itemObject->getArrayCopy();
    }
}