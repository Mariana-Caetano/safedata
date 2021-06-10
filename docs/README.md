

# SafeData

The SafeData app provides an easy to use, configurable middleware to retrieve and save MasterData (V1 & V2) information directly on the front-end (or through another back-end as well).

It works by acting as an validation/authorization layer on top of masterdata api to ensure the data being queried/changed belongs to the user executing the action.

## Getting Started

You can install it through the app store or the command-line interface:

```
vtex install vtex.safedata@0.x
```

The base configurations for CL (Client) and AD (Address) entities are automatically configured but can be changed by using the app settings interface (this is currently a work-in-progress)

Upon installing, some public routes will become instantly available to use.

## Syntax

SafeData respects the same MasterData routes which can be accessed by replacing `api/dataentities` for `safedata`:

Suppose your account name is `myaccount`:
`GET https://myaccount.myvtex.com/safedata/AD/search?_where=addressName=12345`

You can also use `vtexcommercestable` if you prefix the request with `api/io`, like this:
`GET https://myaccount.vtexcommercestable.com.br/api/io/safedata/AD/search?_where=addressName=12345`

In this case, we're conducting a search on the address entity.

## Supported Routes

As of this writing, SafeData supports the following routes:

Get document:
`GET /safedata/{entity}/documents/{documentId}`

Search documents:
`GET /safedata/{entity}/search`

Create document:
`POST /safedata/{entity}/documents`

Entire document update:
`PUT /safedata/{entity}/documents/{documentId}`

Partial document update:
`PATCH /safedata/{entity}/documents/{documentId}`

All underscore query parameters are supported (_where, _fields, _schema and so on)

## How does SafeData work?

The whole process is based on the `CL` entity, which is used as a guide to identify the user. First, we reach out to Vtex ID to confirm the `StoreUserAuthToken` is valid and get the user e-mail. Then we retrieve only the necessary fields on the `CL` entity to ensure the user is manipulating/obtaining only entities that belongs to them.

This is done through a field comparison between `CL` and whatever entity is being queried. For instance, when searching for documents of the `AD` entity, we compare their `userId` to the `id` found in the `CL` entity, and the action is only allowed if they match.

It is possible to allow other MasterData entities to follow these rules by registering them on the app settings:

![SafeData Config](https://user-images.githubusercontent.com/1629129/119353802-b9405d80-bc79-11eb-95b2-9cbc5574fb0a.png)

*Please be aware that the field options are currently unavailable, and users are allowed to update any fields.*

## Roadmap

- Delete operation
- White-listing updateable fields
- Scroll operation