<?php

namespace LinkCMS\Model;

class MenuItem {
    var $attr;
    var $childSlugs = [];
    var $children = [];
    var $hasChildren = false;
    var $href;
    var $name;
    var $positionWeight;
    var $slug;

    public function __construct(String $slug, String $name, String $href, $attr=false, $weight=50) {
        $this->slug = $slug;
        $this->name = $name;
        $this->href = $href;
        $this->positionWeight = $weight;
        if ($attr && (is_object($attr) || is_array($attr)) ) {
            $this->attr = new \stdClass();
            foreach ($attr as $param=>$value) {
                $this->attr->{$param} = $value;
            }
        }
    }

    public function add_child_item(MenuItem $item) : bool {
        if (!in_array($item->slug, $this->childSlugs)) {
            array_push($this->children, $item);
            array_push($this->childSlugs, $item->slug);
            $this->hasChildren = true;
            return true;
        } else {
            return false;
        }
    }

    public function remove_child_item(String $name) : bool {
        if ($this->hasChildren) {
            foreach ($this->children as $child) {
                if ($child->name == $name) {
                    unset($child);
                    return true;
                }
            }
        }
        return false;
    }

    public function get_children() {
        $childrenObject = new \ArrayObject($this->children);
        $childrenObject->uasort(function($a, $b) {
            if ($a->weight == $b->weight) {
                return ($a->slug < $b->slug) ? -1 : 1;
            } else {
                return ($a->weight < $b->weight) ? -1 : 1;
            }
        });
        return $childrenObject;
    }
}