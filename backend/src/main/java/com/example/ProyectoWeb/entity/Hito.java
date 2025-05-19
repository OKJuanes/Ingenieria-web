package com.example.ProyectoWeb.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "hito")
public class Hito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String descripcion;

    @Column(nullable = false)
    private String categoria;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    @Temporal(TemporalType.DATE)
    private Date fechaRegistro;

    // Relación con Usuario (estudiante o profesor que recibió el reconocimiento)
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario beneficiario;

    // Relación con Evento (opcional, si el hito está asociado a un evento)
    @ManyToOne
    @JoinColumn(name = "evento_id", nullable = true)
    private Evento eventoRelacionado;
}
