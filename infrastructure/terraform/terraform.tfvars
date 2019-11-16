token               = "TOKEN" # set here since it's used in 2 places
domain_name         = "app.basset.io"
zone                = "basset.io." # the zone(domain) that is currently hosted in route53
cname               = "basset"
assets_bucket       = "asset"
screenshots_bucket  = "screenshots"
private_assets      = "0"
private_screenshots = "0"

# these values can be left as they are
ecr_name            = "basset_render_diff"
compute_name        = "basset_render_diff"
batch_queue_name    = "basset_render_diff"
definition_name     = "basset_render_diff"
key_name            = "basset_key"
