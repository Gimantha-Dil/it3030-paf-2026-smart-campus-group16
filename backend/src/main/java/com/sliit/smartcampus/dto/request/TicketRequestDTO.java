package com.sliit.smartcampus.dto.request;

import com.sliit.smartcampus.enums.TicketCategory;
import com.sliit.smartcampus.enums.TicketPriority;
import jakarta.validation.constraints.*;

public class TicketRequestDTO {
    private Long resourceId;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 2000, message = "Description must be between 20 and 2000 characters")
    private String description;

    @NotBlank(message = "Priority is required")
    private String priority;

    @Size(max = 200, message = "Contact details cannot exceed 200 characters")
    private String contactDetails;

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long v) { this.resourceId = v; }

    public String getCategory() { return category; }
    public void setCategory(String v) { this.category = v; }

    public TicketCategory getCategoryEnum() {
        try { return TicketCategory.valueOf(category); }
        catch (Exception e) { return TicketCategory.OTHER; }
    }

    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v != null ? v.trim() : null; }

    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v != null ? v.trim() : null; }

    public String getPriority() { return priority; }
    public void setPriority(String v) { this.priority = v; }

    public TicketPriority getPriorityEnum() {
        try { return TicketPriority.valueOf(priority); }
        catch (Exception e) { return TicketPriority.MEDIUM; }
    }

    public String getContactDetails() { return contactDetails; }
    public void setContactDetails(String v) { this.contactDetails = v != null ? v.trim() : null; }
}
