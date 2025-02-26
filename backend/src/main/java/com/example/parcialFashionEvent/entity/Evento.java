package com.example.parcialFashionEvent.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@Entity
@Table(name = "evento")
public class Evento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String tipo;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyy")
    @Temporal(TemporalType.TIMESTAMP)
    private Date fecha;

    @Column(nullable = false)
    private int CantParticipantes;
    
    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    // Tabla de invitados al evento
    @ManyToMany()
    @JoinTable(
            name = "evento_usuario",
            joinColumns = @JoinColumn(name = "evento_id"),
            inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private List<Usuario> invitados = new ArrayList<>();;

    public List<String> getInvitados() {
        List<String> usernames = this.invitados.stream().map(Usuario::getUsername).toList();
        return usernames;
    }
    public void addInvitado(Usuario usuario){
        this.invitados.add(usuario);
    }
    public void removeInvitado(Usuario usuario){
        this.invitados.remove(usuario);
    }

    @ManyToMany()
    @JoinTable(
            name = "evento_Invitado",
            joinColumns = @JoinColumn(name = "evento_id"),
            inverseJoinColumns = @JoinColumn(name = "Invitado_id")
    )
    private List<Usuario> participantes = new ArrayList<>();

    public List<String> getParticipantes() {
        List<String> usernames = this.participantes.stream().map(Usuario::getUsername).toList();
        return usernames;
    }
    public void addParticipante(Usuario usuario){
        this.participantes.add(usuario);
    }
    public void removeParticipante(Usuario usuario){
        this.participantes.remove(usuario);
    }

}
