#!/usr/bin/env groovy

timestamps {
  def repo_slug = 'dependabot-auto-merge'
  def frontend_tools_dir = "/home/deploy/${repo_slug}"
  def git_commit
  def is_master
  def is_integration_branch
  def is_dev_dep_bump
  def do_build

  node('master') {
    fileLoader.withGit('git@github.com:alkemics/lib-groovy-jenkins.git', 'master', 'github-read', '') {
      workflow = fileLoader.load('Workflow')
    }
  }

  def run_or_skip = { condition, closure ->
    if (condition) {
      closure()
    } else {
      echo('skip')
    }
  }

  node(repo_slug) {
    wrap([$class: 'AnsiColorBuildWrapper', colorMapName: 'xterm']) {
      try {
        stage('Initialization') {
          git_commit = common.initialize(repo_slug, false)
        }

        stage('Install'){
          run_or_skip(do_build, {
            nodejs.install()
          })
        }

        workflow.run_tasks_queue([
          {
            stage('Test') {
              run_or_skip(do_build, {
                nodejs.npm_run('test:jest')
              })
            }
          },
          {
            stage('Lint JS') {
              run_or_skip(do_build, {
                nodejs.npm_run('test:lint')
              })
            }
          },
          {
            stage('Check formatting') {
              run_or_skip(do_build, {
                nodejs.npm_run('test:format')
              })
            }
          },
        ])

        stage('Finalisation') {
          common.notify_github_pr(repo_slug, git_commit, common.state_success)
        }
      } catch(e) {
        println(e)
        common.notify_github_pr(repo_slug, git_commit, common.state_failed)
        error('Build failed')
      }
    }
  }
}
