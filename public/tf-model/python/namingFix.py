"""
this is only a fix for models converter from the model.save() function of
keras version 2.2.2

other versions have not been tested.
there is a fix underway (Oct 10 2018): https://github.com/tensorflow/tfjs-layers/pull/332
but its a unrelated fix for tensorflow.keras

unsure if naming conventions (this error) in keras has been reported yet
"""
import json

error_model = json.load(open('./model/model.json'))

print(json.dumps(error_model, indent=4, ensure_ascii=False))


def get_model_topology_name(error_model_dict):
    topo = error_model_dict['modelTopology']['model_config']

    if not topo['class_name'] == "Sequential":
        raise SystemError('fix has only been tested on Sequential keras models')

    output = []
    for c in topo['config']:
        output.append(c['config']['name'])

    return output


def fix_weights_manifest(error_model_dict):
    # get list of keras layer names
    layer_names = get_model_topology_name(error_model_dict)
    print("model layer names: ", layer_names)

    w_manifest = error_model_dict['weightsManifest']  # list
    print(len(w_manifest))

    fixed_model_dict = error_model_dict
    for i, m in enumerate(w_manifest):
        print("weight file: ", m['paths'])
        weights = m['weights']
        print("weights: ", weights)
        for j, w in enumerate(weights):
            weight_name_pcs = w['name'].split('/')
            name = weight_name_pcs[0]
            rest_of_name = weight_name_pcs[1]
            if name in layer_names:
                print('yay no fix needed!', w)
            else:
                print('fixing based on assumption of extra underscore')
                pcs = name.split('_')[:-1]
                fix = "_".join(pcs)

                if fix in layer_names:
                    print('found matching weights group! fixing...')
                    fixed_model_dict['weightsManifest'][i]['weights'][j]['name'] = '/'.join([fix, rest_of_name])

    return fixed_model_dict



fixed_model = fix_weights_manifest(error_model)

print(json.dumps(fixed_model, indent=4))

with open('./model/fixed.json', "w") as outFile:
    json.dump(fixed_model, outFile)