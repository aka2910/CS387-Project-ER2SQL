function convert_json_to_ER(json) {
    // create ER object from json   
    json_obj = JSON.parse(json);
    var er = new ER();
    // stoe in a map entity name -> entity
    var entity_map = {};
    for (var i = 0; i < json_obj.entities.length; i++) {
        var entity = json_obj.entities[i];
        var attributes = [];
        for (var j = 0; j < entity.attributes.length; j++) {
            var attribute = entity.attributes[j];
            attributes.push(new Attribute(attribute.name, attribute.data_type, attribute.is_key));
        }
        er.addEntity(new Entity(entity.name, attributes, entity.is_weak));
        entity_map[entity.name] = er.entities[i];
    }

    for (var i = 0; i < json_obj.relations.length; i++) {
        var relation = json_obj.relations[i];
        var e1 = entity_map[relation.e1];
        var e2 = entity_map[relation.e2];
        var c1 = relation.c1;
        var c2 = relation.c2;
        var p1 = relation.p1;
        var p2 = relation.p2;
        var attributes = [];
        for (var j = 0; j < relation.attributes.length; j++) {
            var attribute = relation.attributes[j];
            attributes.push(new Attribute(attribute.name, attribute.data_type, attribute.is_key));
        }
        er.addRelation(new Relation(relation.name, e1, e2, c1, c2, p1, p2, relation.is_weak, attributes));
    }
    return er;
}