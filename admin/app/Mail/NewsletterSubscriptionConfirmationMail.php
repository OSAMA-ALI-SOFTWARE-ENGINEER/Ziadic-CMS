<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class NewsletterSubscriptionConfirmationMail extends Mailable
{
    use Queueable;

    public function __construct(public string $email) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to the Zaidic Newsletter',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter-subscription-confirmation',
            with: [
                'email' => $this->email,
            ],
        );
    }
}
