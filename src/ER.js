class Entity{
    constructor(name, attributes, is_weak){
        this.name = name;
        this.attributes = attributes;
        this.is_weak = is_weak;
    }

    addAttribute(attribute){
        this.attributes.push(attribute);
    }
}

class Attribute{
    constructor(name,  data_type, is_key=False){
        this.name = name;
        this.data_type = data_type;
        this.is_key = is_key;
     }
}

class Relation{
    constructor(name, e1,e2,c1,c2, is_weak){
        this.name = name;
        this.entities = [e1, e2];
        this.cardinality = [c1,c2];
        this.is_weak = is_weak;
    }

    addAttribute(attribute){
        this.attributes.push(attribute);
    }
}

class ER{
    constructor(){
        this.entities = [];
        this.relations = [];
    }

    addEntity(entity){
        this.entities.push(entity);
    }

    addRelation(relation){
        this.relations.push(relation);
    }
}



// frontend json -> parsed json -> ER class -> SQL

// function convert_ER_to_json(er){

// }

function convert_json_to_ER(json){

}

function convert_ER_to_SQL(er){
    
}

