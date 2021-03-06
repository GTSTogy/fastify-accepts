'use strict'

const accepts = require('accepts')

const fp = require('fastify-plugin')

const acceptsObjectSymbol = Symbol('acceptsObject')

const methodNames = [
  'charset', 'charsets',
  'encoding', 'encodings',
  'language', 'languages',
  'type', 'types'
]

function acceptsMethod () {
  if (!this.req[acceptsObjectSymbol]) {
    this.req[acceptsObjectSymbol] = accepts(this.req)
  }
  return this.req[acceptsObjectSymbol]
}

function replyAcceptMethod () {
  if (!this.request[acceptsObjectSymbol]) {
    this.request[acceptsObjectSymbol] = accepts(this.request.req)
  }
  return this.request[acceptsObjectSymbol]
}

function fastifyAcceptHeader (fastify, options, done) {
  options = options || {}
  const decorateReplyToo = options.decorateReply

  fastify.decorateRequest('accepts', acceptsMethod)

  methodNames.forEach(methodName => {
    fastify.decorateRequest(methodName, function (arr) {
      const acceptsObject = this.accepts()
      if (arguments.length === 0) return acceptsObject[methodName]()
      return acceptsObject[methodName](arr)
    })
  })

  if (decorateReplyToo) {
    fastify.decorateReply('requestAccepts', replyAcceptMethod)

    methodNames.forEach(methodName => {
      const capitalizedMethodName = methodName.replace(/(?:^|\s)\S/g, a => a.toUpperCase())
      fastify.decorateReply('request' + capitalizedMethodName, function (arr) {
        const acceptsObject = this.requestAccepts()
        if (arguments.length === 0) return acceptsObject[methodName]()
        return acceptsObject[methodName](arr)
      })
    })
  }

  done()
}

module.exports = fp(fastifyAcceptHeader, {
  fastify: '>= 0.39.1',
  name: 'fastify-accepts'
})
