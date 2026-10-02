# Git Synchronization Protocol v2.4

This document serves as the master authority for maintaining the connection between the **Ferocious Technologies ERP** workspace and the remote GitHub repository.

## 01. Diagnostic Matrix
If you encounter "Repository not found" errors, verify the remote identity:
- **Command**: `git remote -v`
- **UI Node**: Check the **Deployment** tab in the Studio sidebar.

## 02. Reconnection Sequence
If the remote points to a placeholder (e.g., `YOUR_USERNAME`), execute the following recovery protocol:

1. **Purge Invalid Remote**:
   ```bash
   git remote remove origin
   ```

2. **Initialize Real Identity**:
   ```bash
   git remote add origin https://github.com/<your-username>/FerociousTechnologies.git
   ```

3. **Synchronize Master Branch**:
   ```bash
   git push -u origin main
   ```

## 03. Maintenance Rules
- **Do NOT** force push unless authorized by the system lead.
- **Always** pull latest changes before starting an engineering session to avoid matrix collisions.
- **Stage** all core nodes (`src`, `docs`, `config`) for every commit to ensure the remote reflects the full industrial state.

---
**Status**: LOCAL_HEALTHY | REMOTE_PENDING_RECONNECT