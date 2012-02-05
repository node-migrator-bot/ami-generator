RESTART_SECRET_KEY=$(pwgen -n -B 10 1)

curl -X PUT http://127.0.0.1:5984/_config/admins/nodester -d '"secret"'

cat >> /lib/nodester/config.js <<EOF
exports.opt = {
  couch_user: 'nodester',
  couch_pass: 'secret',
  couch_host: '127.0.0.1',
  couch_port: 5984,
  couch_prefix: 'nodester',
  couch_tables: ['coupons', 'nodefu', 'nextport', 'apps', 'repos', 'aliasdomains', 'password_resets'],
  home_dir: '/home/nodester',
  app_dir: '/lib/nodester',
  git_home_dir: '/git',
  apps_home_dir: '/app',
  public_html_dir: '/lib/nodester/public',
  proxy_table_file: '/home/nodester/var/proxy_table.json',
  tl_dom: 'testnodester.com',
  api_dom: 'api.testnodester.com',
  git_user: 'nodester',
  git_dom: 'testnodester.com',
  coupon_code: 'CouponCode',
  blocked_apps: ['www', 'api', 'admin', 'support', 'blog', 'site'],
  restart_key: '$(RESTART_SECRET_KEY)',
  userid: 'nodester',
  app_uid: 100,
  enable_ssl: false, // Currently SSL forward to the app/api, when I have a wildcard cert to test, then all apps can have SSL.
  ssl_ca_file: '',
  ssl_cert_file: '',
  ssl_key_file: '',
  node_base_folder: '/opt/node-v0.4.9_npm_v1.0.3',

  //Amazon SES mail info
  SES: {
    AWSAccessKeyID: 'ACCESSKEY',
    AWSSecretKey: 'SECRETKEY',
    ServiceUrl: 'https://email.us-east-1.amazonaws.com',
  }
};
EOF

cat >> /lib/nodester/scripts/gitrepoclone.sh <<EOM
#!/bin/bash
# post-commit hook to create git file directory for node subdomain
SECRETKEY=$(RESTART_SECRET_KEY)
GITBASE=/git
APPSBASE=/app

OLD_PWD=$PWD
gitdirsuffix=${PWD##*/}
gitdir=${gitdirsuffix%.git}
GITBASELEN=${#GITBASE};
OLD_PWDLEN=${#OLD_PWD};
MY_LEN=$(( ${OLD_PWDLEN} - ${GITBASELEN} - 4 ));
appdir="${APPSBASE}${OLD_PWD:${GITBASELEN}:${MY_LEN}}";

if [ -d "${appdir}" ]; then
  echo "Syncing repo with chroot"
  cd ${appdir};
  unset GIT_DIR;
  git pull;
else
  echo "Fresh git clone into chroot"
  mkdir -p ${appdir};
  git clone . ${appdir};
  cd ${appdir};
fi

hook=./.git/hooks/post-receive
if [ -f "$hook" ]; then
    rm $hook
fi

if [ -f ./.gitmodules ]; then
    echo "Found git submodules, updating them now..."
    git submodule init;
    git submodule update;
fi

cd $OLD_PWD

echo "Attempting to restart your app: ${gitdir}"
curl "http://127.0.0.1:4001/app_restart?repo_id=${gitdir}&restart_key=${SECRETKEY}" 2>/dev/null
echo ""
echo "App restarted.."
echo ""
echo "  \m/ Nodester out \m/"
echo ""
exit 0;
EOM

cd /lib/nodester 

node scripts/couchdb/create_all_couchdb_tables.js
node scripts/couchdb/setup_default_views.js

./bin/app_start.sh
./bin/proxy_start.sh
