# DATA FLOW

Status: FROZEN

This document defines the complete lifecycle of a locator.

No implementation is allowed to violate this flow.

------------------------------------------------------

STEP 1

Developer saves React file.

↓

Vite transform starts.

------------------------------------------------------

STEP 2

Babel parses source.

↓

AST

------------------------------------------------------

STEP 3

Single Visitor Traversal

Visitor maintains

Component Stack

Locator Stack

Hook Stack

Generation Context

------------------------------------------------------

STEP 4

Component Detection

Enter Component

Push Component Stack

Exit Component

Pop Component Stack

------------------------------------------------------

STEP 5

Hook Detection

Current Component

↓

Append hook list

------------------------------------------------------

STEP 6

JSX Detection

Every JSXOpeningElement

↓

Tag Classification

↓

HTML

Component

SVG

Fragment

Portal

------------------------------------------------------

STEP 7

Hierarchy

Current Locator Stack

↓

Parent

↓

Children

↓

Depth

------------------------------------------------------

STEP 8

Metadata

Create LocatorMetadata

↓

Assign Stable ID

↓

Assign Parent

↓

Assign Component

↓

Assign Hooks

↓

Assign Attributes

------------------------------------------------------

STEP 9

Injection

Inject

data-locator-id="xxxxxxxx"

------------------------------------------------------

STEP 10

Registry

Store Metadata

Map<ID, Metadata>

------------------------------------------------------

STEP 11

Generate

Generate transformed source

↓

Return to Vite

------------------------------------------------------

STEP 12

Server

Keep registry in memory

Serve

/__locator

/__open

/__locator-options

------------------------------------------------------

STEP 13

Browser Runtime

Fetch Registry

↓

Cache Registry

------------------------------------------------------

STEP 14

Mouse Move

elementFromPoint()

↓

closest(data-locator-id)

↓

Registry Lookup

↓

Overlay

------------------------------------------------------

STEP 15

Ctrl + Click

Lookup Metadata

↓

POST

/__open

↓

Editor

↓

VSCode

Cursor

Windsurf

------------------------------------------------------

Runtime NEVER

Generate Metadata

Parse AST

Generate IDs

------------------------------------------------------

Transform NEVER

Touches DOM

------------------------------------------------------

Server NEVER

Parses React

------------------------------------------------------

Overlay NEVER

Reads AST

------------------------------------------------------

Editor NEVER

Reads Registry

------------------------------------------------------

Everything has exactly ONE responsibility.