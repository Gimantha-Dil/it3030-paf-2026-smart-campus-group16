package com.sliit.smartcampus.entity;

import jakarta.persistence.*;

@Entity @Table(name = "comments")
public class Comment extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ticket_id", nullable = false) private Ticket ticket;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "author_id", nullable = false) private User author;
    @Column(columnDefinition = "TEXT", nullable = false) private String content;

    public Comment() {}
    public Ticket getTicket() { return ticket; } public void setTicket(Ticket v) { this.ticket = v; }
    public User getAuthor() { return author; } public void setAuthor(User v) { this.author = v; }
    public String getContent() { return content; } public void setContent(String v) { this.content = v; }

    public static CommentBuilder builder() { return new CommentBuilder(); }
    public static class CommentBuilder {
        private final Comment c = new Comment();
        public CommentBuilder ticket(Ticket v) { c.ticket = v; return this; }
        public CommentBuilder author(User v) { c.author = v; return this; }
        public CommentBuilder content(String v) { c.content = v; return this; }
        public Comment build() { return c; }
    }
}
