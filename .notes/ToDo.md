- intigration:
    <!-- - create_by INTEGER REFERENCES users(id) ON DELETE SET users(id), -- Self-referencing for creator (can be NULL for initial records) -->
    - Add create By <UserID> on Ceatting New Personnel/User 
    - Requisitions(Page) > Owner(Field) > AllUser
    - First Row of Data Table > No. or ID
    - MT table QTY. DT > Float


- delation:
    <!-- - Inventory (Materials) -->
    <!-- - req forms -->
    <!-- - User -->

- edit:
    <!-- - Requisitions -->
    - MR-FORM
        -MT.filter > MT not in MR-FORM
        -MT.delete > Rebase UI
    - MT
        -add QTY. btn
        -

    - ALL table
        - update_at
        - update logs

- UI:
    - Global Search: (later)
    _________________________________________________
        -Optional:
            - replace icon loading > Loading Skeleton
            - 
    -
-Page:
    - Requisition:
        * Accept / Reject Button
        * Form Validate font/back end
        * Filter Search   
        * Material Eval on Accept
    - Users:
        * Action button > View, Edit 
        * 
    - CreateUser:
        * 
        * 
    - EditUser:
        * 
        * 


-Errs-Fallback:
    -Api fallback
    -


- functional:
    - Inventory (Materials): Full search, Filters by(date, itemID, TypeID, UserID, Status), Analyzes,
    - Logout (Bottom-Left Cornor)
    - Additional Language (Thai, English)
    _________________________________________________
        - Optional:
            - Logs page (SAdmin only)
            - Creste/Edits Logs Table
            - TestCase Script


