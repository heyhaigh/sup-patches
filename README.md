# sup-patches

A collection of SupChat patches.

## Patches

| Patch | Description | Status |
|-------|-------------|--------|
| [jetgrind](./jetgrind/) | Jet Grind Radio style graffiti tag generator | Active (v1.2.27) |
| [buythelook](./buythelook/) | [TBD] | In Development |

## Repository Structure

```
/sup-patches/
├── README.md                    # This file
├── SUPCHAT_REFERENCE.md         # Shared SupChat API docs
│
├── /jetgrind/
│   ├── jetgrind.js              # Current active version
│   ├── README.md
│   ├── CHANGELOG.md
│   ├── LEARNINGS.md
│   ├── /versions/               # Version archive
│   └── /assets/
│
├── /buythelook/
│   ├── buythelook.js            # Current active version
│   ├── README.md
│   ├── CHANGELOG.md
│   ├── LEARNINGS.md
│   ├── /versions/
│   └── /assets/
│
└── /shared/                     # Reusable utilities
```

## Development Notes

- Each patch has its own directory with active `.js` file at root
- Version history archived in `/versions/` subfolder
- Patch-specific documentation in each directory
- Shared SupChat reference at repo root

## Resources

- [SupChat Platform](https://supchat.com/chat/)
- [SupChat Docs](https://supchat.com/docs/guides/getting-started)
- [Full API Documentation](https://supchat.com/docs/llms.txt)
