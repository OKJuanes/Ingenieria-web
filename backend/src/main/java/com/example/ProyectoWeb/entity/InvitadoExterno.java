package com.example.ProyectoWeb.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "invitado_externo")
public class InvitadoExterno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(nullable = false)
    private String correo;

    @Column(nullable = false)
    private String telefono;

    @Column(nullable = true)
    private String empresa;
    
    // Relación ManyToOne con Evento en lugar de ManyToMany
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;
}
