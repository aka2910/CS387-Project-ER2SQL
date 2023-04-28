var {Entity, Attribute, Relation, ER} = require('../src/ER.js');
var Parsed_to_Classes = require('./json_convert.js');
var Frontend_to_Parsed = require('./parsed_to_structured.js');
var {Table, Foreign_Key} = require('./Schema.js');

function ER_to_SQL(frontend_json){
    var Parsed_Json = Frontend_to_Parsed(frontend_json);
    var er = Parsed_to_Classes(Parsed_Json);
    Vertices = [];
    Edges = [];
    var table_map = {};
    var entity_map = er.entity_map;
    for(var i = 0; i < er.entities.length; i++){
        e = er.entities[i];
        var table = new Table(e.name);
        Vertices.push(e.name);
        for(var j = 0; j < e.attributes.length; j++){
            attr = e.attributes[j];
            table.addAttribute(attr);
            if(attr.is_key){
                table.addPrimaryKey(attr.name);
            }
        }
        // table.print_sql();
        table_map[e.name] = table;
    }
    for(var i = 0; i < er.relations.length; i++){
        r = er.relations[i];
        // console.log(r);
        if(r.is_weak){
            weak_entity = entity_map[r.e2.name];
            weak_table = table_map[weak_entity.name];
            ident_entity = entity_map[r.e1.name];
            ident_table = table_map[ident_entity.name];
            for (var j=0; j<r.attributes.length; j++){
                attr = r.attributes[j];
                weak_table.addAttribute(attr);
                if(attr.is_key){
                    weak_table.addPrimaryKey(attr.name);
                }
                weak_entity.addAttribute(attr);
            }
            keys_list = [];
            for(var j = 0; j < ident_entity.attributes.length; j++){
                attr = { ...ident_entity.attributes[j] };
                if(attr.is_key){
                    if(weak_table.attributes.map(attr1=>attr1.name).includes(attr.name)){
                        attr.name = ident_entity.name+'_'+attr.name;
                    }
                    weak_table.addAttribute(attr);
                    weak_table.addPrimaryKey(attr.name);
                    weak_entity.addAttribute(attr);
                    keys_list.push(attr.name);
                }
                
            }
            foreign = new Foreign_Key(keys_list, ident_table.name);
            Edges.push([ident_table.name, weak_table.name]);
            weak_table.addForeignKey(foreign);
            table_map[weak_entity.name] = weak_table;
            entity_map[weak_entity.name] = weak_entity;
        }
    }
    for(var i = 0; i < er.relations.length; i++){
        r = er.relations[i];
        if(!r.is_weak){
        // Assuming partial participation for now
            if(r.c1=="many" && r.c2=="many"){
                var table = new Table(r.name);
                Vertices.push(r.name);
                for(var j = 0; j < r.attributes.length; j++){
                    attr = r.attributes[j];
                    table.addAttribute(attr);
                    if(attr.is_key){
                        table.addPrimaryKey(attr.name);
                    }
                }
                var e1 = entity_map[r.e1.name];
                var e2 = entity_map[r.e2.name];
                keys_list = [];
                for (var j = 0; j < e1.attributes.length; j++) {
                    attr = { ...e1.attributes[j]};
                    if(table.attributes.map(attr1=>attr1.name).includes(attr.name)){
                        attr.name = e1.name+'_'+attr.name;
                    }
                    if (attr.is_key) {
                        table.addAttribute(attr);
                        table.addPrimaryKey(attr.name);
                        keys_list.push(attr.name);
                    }
                }
                foreign = new Foreign_Key(keys_list, e1.name);
                Edges.push([e1.name, table.name]);
                table.addForeignKey(foreign);
                keys_list = [];
                for (var j = 0; j < e2.attributes.length; j++) {
                    attr = e2.attributes[j];
                    if(table.attributes.map(attr1=>attr1.name).includes(attr.name)){
                        attr.name = e2.name+'_'+attr.name;
                    }
                    if (attr.is_key) {
                        table.addAttribute(attr);
                        table.addPrimaryKey(attr.name);
                        keys_list.push(attr.name);
                    }
                }
                foreign = new Foreign_Key(keys_list, e2.name);
                Edges.push([e2.name, table.name]);
                table.addForeignKey(foreign);
                table_map[r.name] = table;
            }
            else if(r.c1=="many" && r.c2=="one"){
                var e1 = entity_map[r.e1.name];
                var e2 = entity_map[r.e2.name];
                var t1 = table_map[r.e1.name];
                var t2 = table_map[r.e2.name];
                keys_list = [];
                for(var j=0;j<t2.attributes.length;j++){
                    var attr = { ... t2.attributes[j]};
                    if(attr.is_key){
                        if(t1.attributes.map(attr1=>attr1.name).includes(attr.name)){
                            attr.name = e2.name+'_'+attr.name;
                        }
                        if(r.p1=='total' && r.p2=='partial'){
                            attr.is_null=false;
                        }
                        attr.is_key=false;
                        t1.addAttribute(attr);    
                        keys_list.push('1'+attr.name);
                    }
                }
                foreign = new Foreign_Key(keys_list, t2.name);
                Edges.push([t2.name, t1.name]);
                t1.addForeignKey(foreign);
                table_map[r.e1.name] = t1;
            }
            else if(r.c2=="many" && r.c1=="one"){
                var e1 = entity_map[r.e1.name];
                var e2 = entity_map[r.e2.name];
                var t1 = table_map[r.e1.name];
                var t2 = table_map[r.e2.name];
                keys_list = [];
                for(var j=0;j<t1.attributes.length;j++){
                    var attr = { ...t1.attributes[j]};
                    // console.log('1111111');
                    // console.log(r.name);
                    // console.log(attr);
                    if(attr.is_key){
                        if(t2.attributes.map(attr1=>attr1.name).includes(attr.name)){
                            attr.name = e1.name+'_'+attr.name;
                        }
                        if(r.p2=='total' && r.p1=='partial'){
                            attr.is_null=false;
                        }
                        attr.is_key=false;
                        t2.addAttribute(attr);
                        keys_list.push(attr.name);
                    }
                }
                foreign = new Foreign_Key(keys_list, t1.name);
                Edges.push([t1.name, t2.name]);
                t2.addForeignKey(foreign);
                table_map[r.e2.name] = t2;
            }
            else {
                var e1 = entity_map[r.e1.name];
                var e2 = entity_map[r.e2.name];
                var t1 = table_map[r.e1.name];
                var t2 = table_map[r.e2.name];
                if(r.p1=='total' && r.p2=='partial'){
                    t1,t2 = t2,t1
                    e1,e2 = e2,e1
                }
                keys_list = [];
                for(var j=0;j<t1.attributes.length;j++){
                    var attr = { ...t1.attributes[j]};
                    if(attr.is_key){
                        if(t2.attributes.map(attr1=>attr1.name).includes(attr.name)){
                            attr.name = e1.name+'_'+attr.name;
                        }
                        if((r.p2=='total' && r.p1=='partial')||(r.p1=='total' && r.p2=='partial')){
                            attr.is_null=false;
                        }
                        attr.is_key=false;
                        t2.addAttribute(attr);
                        keys_list.push(attr.name);
                    }
                }
                foreign = new Foreign_Key(keys_list, t1.name);
                Edges.push([t1.name, t2.name]);
                t2.addForeignKey(foreign);
                table_map[r.e2.name] = t2;
            }
        }
    }
    //topological sort of tables

    topological_sort = [];
    visited = {};
    function dfs(node){
        visited[node] = true;
        for(var i=0;i<Edges.length;i++){
            if(Edges[i][0]==node && !visited[Edges[i][1]]){
                dfs(Edges[i][1]);
            }
        }
        topological_sort.push(node);
    }
    for(var i=0;i<Vertices.length;i++){
        visited[Vertices[i]] = false;
    }
    for(var i=0;i<Vertices.length;i++){
        if(!visited[Vertices[i]]){
            dfs(Vertices[i]);
        }
    }
    topological_sort.reverse();

    for(var i=0;i<topological_sort.length;i++){
        table = table_map[topological_sort[i]];
        table.print_sql();
    }
    return "Hello";
}

module.exports = ER_to_SQL;

// ER_to_SQL(er);