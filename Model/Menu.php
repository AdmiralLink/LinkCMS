<?php

namespace LinkCMS\Model;

class Menu {
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
            array_push($this->items, $item);
            array_push($this->itemSlugs, $item->slug);
        }
    }

    public function get_items() {
        $itemObject = new \ArrayObject($this->items);
        $itemObject->uasort(function($a, $b) {
            if ($a->weight == $b->weight) {
                return ($a->slug < $b->slug) ? -1 : 1;
            } else {
                return ($a->weight < $b->weight) ? -1 : 1;
            }
        });
        return $itemObject->getArrayCopy();
    }
}